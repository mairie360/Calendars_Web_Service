import { NextRequest } from 'next/server';
import { allowedMethods, findContractRoute, requestBodyMediaTypes } from './bff-contract';

type RouteContext = { params: Promise<{ path: string[] }> };

/** Taille maximale d'un corps relayé : les corps du contrat sont de petits documents JSON. */
export const MAX_REQUEST_BODY_BYTES = 1024 * 1024;

// En-têtes du navigateur transmis au BFF. Tout le reste (cookies, Authorization fourni par le client,
// X-Forwarded-*, en-têtes ajoutés par le middleware…) est écarté.
const FORWARDED_REQUEST_HEADERS = [
  'accept', 'accept-language', 'content-type', 'if-match', 'if-none-match', 'if-modified-since', 'if-unmodified-since', 'user-agent', 'x-request-id',
];
const HOP_BY_HOP_RESPONSE_HEADERS = ['content-encoding', 'content-length', 'transfer-encoding', 'connection'];
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function configuredBffUrl() {
  return (process.env.BFF_CALENDAR_BASE_URL ??
    process.env.CALENDAR_BFF_URL ??
    process.env.NEXT_PUBLIC_BFF_CALENDAR_BASE_URL ?? 'http://localhost:4002').replace(/\/+$/, '');
}

function errorResponse(status: number, message: string, headers: Record<string, string> = {}) {
  return Response.json({ error: { message } }, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}

/**
 * Protection CSRF des méthodes non sûres, en plus du cookie `SameSite=Strict` posé par Login : le navigateur
 * doit déclarer une requête de même origine (`Sec-Fetch-Site`), ou à défaut une `Origin` égale à l'hôte servi.
 * Les clients hors navigateur (k6, curl) n'envoient ni l'un ni l'autre et restent acceptés.
 */
export function isCrossSiteRequest(request: NextRequest) {
  if (SAFE_METHODS.has(request.method)) return false;
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite) return fetchSite !== 'same-origin' && fetchSite !== 'none';
  const origin = request.headers.get('origin');
  if (!origin) return false;
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}

/** Lit le corps en s'arrêtant dès que la limite est dépassée (`null` : corps trop volumineux). */
async function readBody(request: NextRequest): Promise<ArrayBuffer | null> {
  if (Number(request.headers.get('content-length') ?? 0) > MAX_REQUEST_BODY_BYTES) return null;
  if (!request.body) return new ArrayBuffer(0);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
    size += chunk.value.byteLength;
    if (size > MAX_REQUEST_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(chunk.value);
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body.buffer;
}

type ForwardOptions = {
  /** Corps déjà lu et contrôlé par l'appelant ; `null` pour ne rien transmettre. Par défaut, le corps reçu. */
  body?: ArrayBuffer | null;
};

export async function forwardToBff(request: NextRequest, baseUrl: string, path: string, options: ForwardOptions = {}) {
  if (isCrossSiteRequest(request)) return errorResponse(403, 'Requête intersite refusée.');

  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value !== null) headers.set(name, value);
  }
  // Seul le cookie HttpOnly posé par Login authentifie : un Authorization fourni par le navigateur est ignoré.
  const accessToken = request.cookies.get('accessToken')?.value;
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  let body: ArrayBuffer | null = null;
  if (!['GET', 'HEAD'].includes(request.method)) {
    body = options.body !== undefined ? options.body : await readBody(request);
    if (options.body === undefined && body === null) return errorResponse(413, 'Corps de requête trop volumineux.');
  }

  const target = new URL(`${baseUrl.replace(/\/+$/, '')}${path}`);
  target.search = new URL(request.url).search;
  try {
    const upstream = await fetch(target, {
      method: request.method, headers, cache: 'no-store', redirect: 'manual',
      signal: AbortSignal.timeout(15_000),
      ...(body && body.byteLength > 0 ? { body } : {}),
    });
    const responseHeaders = new Headers(upstream.headers);
    for (const name of HOP_BY_HOP_RESPONSE_HEADERS) responseHeaders.delete(name);
    responseHeaders.set('Cache-Control', 'no-store');
    return new Response(request.method === 'HEAD' || [204, 205, 304].includes(upstream.status) ? null : upstream.body, {
      status: upstream.status, statusText: upstream.statusText, headers: responseHeaders,
    });
  } catch {
    return errorResponse(502, 'Le service est indisponible.');
  }
}

export async function proxyBffRequest(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  if (path.some((part) => !part || part === '.' || part === '..' || part.includes('/'))) {
    return errorResponse(400, 'Chemin invalide.');
  }
  const route = findContractRoute(path);
  if (!route) return errorResponse(404, 'Route inconnue.');
  const allowed = allowedMethods(route);
  if (!allowed.includes(request.method)) return errorResponse(405, 'Méthode non autorisée.', { Allow: allowed.join(', ') });
  if (isCrossSiteRequest(request)) return errorResponse(403, 'Requête intersite refusée.');

  // Le corps n'est relayé que si le contrat en déclare un, et seulement dans un type de contenu déclaré.
  // Sa validation (schéma, valeurs) reste celle du BFF.
  let body: ArrayBuffer | null = null;
  if (!['GET', 'HEAD'].includes(request.method)) {
    const mediaTypes = requestBodyMediaTypes(route, request.method);
    const received = await readBody(request);
    if (received === null) return errorResponse(413, 'Corps de requête trop volumineux.');
    if (mediaTypes.length > 0 && received.byteLength > 0) {
      const contentType = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() ?? '';
      if (!mediaTypes.includes(contentType)) return errorResponse(415, 'Type de contenu non pris en charge.');
      body = received;
    }
  }

  return forwardToBff(request, configuredBffUrl(), `/${path.map(encodeURIComponent).join('/')}`, { body });
}
