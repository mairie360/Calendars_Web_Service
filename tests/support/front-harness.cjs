const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { AsyncLocalStorage } = require('node:async_hooks');
const { NextRequest } = require('next/server');
const { loadTs } = require('./load-ts.cjs');
const { OpenApiContract } = require('./openapi-contract.cjs');
const { ContractMockServer } = require('./contract-mock-server.cjs');

// Chaîne réseau complète du front, sans navigateur ni build Next.js :
//
//   code client (api.ts, auth-session.ts)  --fetch same-origin-->  serveur du front (vrais route handlers)
//   route handlers (bff-proxy.ts, user-bff-proxy.ts)  --fetch-->  BFF simulés pilotés par leur contrat OpenAPI
//
// Un garde remplace `fetch` : côté client, seules les URL de l'origine du front passent (comme la CSP
// `connect-src 'self'`) ; côté serveur, seuls les BFF simulés sont joignables. Tout autre appel est une
// violation et échoue.

const ROOT = path.resolve(__dirname, '..', '..');
const CALENDAR_CONTRACT = path.join(ROOT, 'contracts', 'openapi.json');

/** Routes de l'App Router servies par des fichiers dédiés (prioritaires sur le catch-all). */
const APP_ROUTES = {
  '/api/user/me': 'app/api/user/me/route',
  '/api/auth/me': 'app/api/auth/me/route',
  '/api/auth/session': 'app/api/auth/session/route',
  '/api/auth/logout': 'app/api/auth/logout/route',
};

/**
 * Contrat de BFF User : celui de la copie locale `BFF_USER_CONTRACT_DIR` (défaut `../../BFFs/BFF_user/contracts`)
 * quand elle existe ; sinon (CI, dépôt seul) une déclaration des seules opérations consommées, sans schéma.
 */
function loadUserContract() {
  const dir = path.resolve(ROOT, process.env.BFF_USER_CONTRACT_DIR ?? '../../BFFs/BFF_user/contracts');
  const file = path.join(dir, 'openapi.json');
  if (fs.existsSync(file)) return { contract: OpenApiContract.load(file), source: file };
  const response = (status) => ({ [status]: { description: 'Déclaration minimale (contrat BFF User absent)' } });
  return {
    source: null,
    contract: new OpenApiContract({
      info: { title: 'bff_user (opérations consommées par le front)' },
      paths: {
        '/me': { get: { responses: { ...response(200), ...response(401), ...response(502) } } },
        '/session/me': { get: { responses: { ...response(200), ...response(401), ...response(502) } } },
        '/auth/logout': { post: { responses: { ...response(200), ...response(500) } } },
      },
    }),
  };
}

class FrontHarness {
  constructor() {
    this.calendarBff = new ContractMockServer('BFF_CALENDAR', OpenApiContract.load(CALENDAR_CONTRACT));
    const user = loadUserContract();
    this.userBff = new ContractMockServer('BFF_USER', user.contract);
    this.userContractSource = user.source;
    this.violations = [];
    /** Requêtes émises par le code client, telles que vues par le front. */
    this.browserRequests = [];
    this.cookies = new Map();
    this.serverContext = new AsyncLocalStorage();
    this.nativeFetch = global.fetch;
    /** Origines serveur autorisées en plus des BFF simulés (ex. port fermé pour simuler une panne). */
    this.extraServerOrigins = new Set();
  }

  get mocks() { return [this.calendarBff, this.userBff]; }

  async start() {
    await Promise.all(this.mocks.map((mock) => mock.start()));
    process.env.BFF_CALENDAR_BASE_URL = this.calendarBff.url;
    process.env.USER_BFF_URL = this.userBff.url;
    this.server = http.createServer((req, res) => {
      this.serverContext.run({ request: `${req.method} ${req.url}` }, () => this.handle(req, res)).catch((error) => {
        this.violations.push(`[FRONT] erreur du serveur de test : ${error.stack ?? error}`);
        if (!res.headersSent) res.writeHead(500);
        res.end();
      });
    });
    await new Promise((resolve) => this.server.listen(0, '127.0.0.1', resolve));
    this.origin = `http://127.0.0.1:${this.server.address().port}`;
    global.fetch = (input, init) => this.guardedFetch(input, init);
  }

  async stop() {
    global.fetch = this.nativeFetch;
    this.server.closeAllConnections();
    await new Promise((resolve) => this.server.close(resolve));
    await Promise.all(this.mocks.map((mock) => mock.stop()));
  }

  reset() {
    for (const mock of this.mocks) mock.reset();
    this.violations.length = 0;
    this.browserRequests.length = 0;
    this.cookies.clear();
    this.extraServerOrigins.clear();
  }

  allowServerOrigin(url) {
    this.extraServerOrigins.add(new URL(url).origin);
  }

  /** Toutes les violations de contrat ou de périmètre réseau collectées depuis le dernier `reset`. */
  allViolations() {
    return [...this.violations, ...this.mocks.flatMap((mock) => mock.violations)];
  }

  async guardedFetch(input, init) {
    const raw = input instanceof Request ? input.url : String(input);
    const serverSide = this.serverContext.getStore();
    if (serverSide) {
      const target = new URL(raw);
      if (!this.extraServerOrigins.has(target.origin) && !this.mocks.some((mock) => target.origin === new URL(mock.url).origin)) {
        this.violations.push(`[FRONT serveur] appel réseau hors BFF simulés : ${target.href} (pendant ${serverSide.request})`);
        throw new TypeError('fetch failed');
      }
      return this.nativeFetch(input, init);
    }

    // Côté client : résolution relative à l'origine du front, comme dans le navigateur.
    const target = new URL(raw, this.origin);
    if (target.origin !== this.origin) {
      this.violations.push(`[FRONT client] appel réseau vers une autre origine : ${target.href}`);
      throw new TypeError('Failed to fetch');
    }
    const headers = new Headers(init?.headers);
    // Le navigateur signale toujours une requête same-origin (voir la protection CSRF du proxy).
    if (!headers.has('sec-fetch-site')) headers.set('sec-fetch-site', 'same-origin');
    if (this.cookies.size) headers.set('cookie', [...this.cookies].map(([name, value]) => `${name}=${value}`).join('; '));
    this.browserRequests.push({ method: (init?.method ?? 'GET').toUpperCase(), path: `${target.pathname}${target.search}` });
    return this.nativeFetch(target, { ...init, headers });
  }

  async handle(req, res) {
    const url = new URL(req.url, this.origin);
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = chunks.length && !['GET', 'HEAD'].includes(req.method) ? Buffer.concat(chunks) : undefined;
    const headers = new Headers();
    for (const [name, value] of Object.entries(req.headers)) headers.set(name, Array.isArray(value) ? value.join(', ') : value);
    const request = new NextRequest(url, { method: req.method, headers, body });

    const response = await this.dispatch(request, url.pathname);
    const responseHeaders = {};
    response.headers.forEach((value, name) => { if (name !== 'set-cookie') responseHeaders[name] = value; });
    const setCookies = response.headers.getSetCookie();
    if (setCookies.length) responseHeaders['set-cookie'] = setCookies;
    res.writeHead(response.status, responseHeaders);
    res.end(Buffer.from(await response.arrayBuffer()));
  }

  /** Routage de l'App Router : route dédiée si elle existe, sinon `src/app/[...path]/route.ts`. */
  dispatch(request, pathname) {
    const routeFile = APP_ROUTES[pathname];
    if (routeFile) {
      const handler = loadTs(routeFile)[request.method];
      return handler ? handler(request) : new Response(null, { status: 405 });
    }
    const handler = loadTs('app/[...path]/route')[request.method];
    if (!handler) return new Response(null, { status: 405 });
    const segments = pathname.split('/').filter(Boolean).map(decodeURIComponent);
    return handler(request, { params: Promise.resolve({ path: segments }) });
  }
}

/** JWT non signé : seul le BFF vérifie la signature, le front ne fait que relayer le cookie. */
function jwtFor(userId, exp = Math.floor(Date.now() / 1000) + 3600) {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: String(userId), exp })}.signature`;
}

module.exports = { FrontHarness, APP_ROUTES, CALENDAR_CONTRACT, jwtFor };
