import axios, { type AxiosAdapter } from "axios";
import { getBffCalendar } from "@mairie360/bff-calendar-openapi/endpoints/bffCalendar";
import { navigateToLogin } from "./logout";

export class BffRequestError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "BffRequestError";
  }
}

async function readResponseBody(response: Response) {
  const text = await response.text();

  if (!text) return undefined;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

// Erreurs du BFF (`ErrorResponse` : { error: { code, message, details } }, enveloppe commune des BFFs) ou du proxy du
// front ({ error: { message } }) ; l'ancien format plat { code, message } reste lu en repli.
function getErrorMessage(status: number, body: unknown) {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    const error = record.error;

    if (error && typeof error === "object") {
      const message = (error as Record<string, unknown>).message;
      if (typeof message === "string" && message.trim()) return message;
    }

    const message = record.message;
    if (typeof message === "string" && message.trim()) return message;
  }

  return status >= 500
    ? "Le service calendrier est temporairement indisponible."
    : "La demande au calendrier n’a pas pu aboutir.";
}

/**
 * Appel same-origin vers le proxy du front. L'authentification repose uniquement sur le cookie HttpOnly
 * `accessToken`, que le proxy convertit en Bearer ; le corps de réponse est celui déclaré par le contrat du BFF.
 */
export async function requestBff<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body !== undefined) headers.set("Content-Type", "application/json");

  const response = await fetch(path, {
    ...init,
    headers,
    cache: "no-store",
    credentials: "same-origin",
  });

  if (!response.ok) {
    const body = await readResponseBody(response);
    if (response.status === 401) navigateToLogin();
    throw new BffRequestError(response.status, getErrorMessage(response.status, body), body);
  }

  if (response.status === 204) return undefined as T;

  return (await readResponseBody(response)) as T;
}

// The generated operations of the published BFF Calendar contract own every path: axios only carries the
// request through requestBff, which keeps the same-origin cookie and 401 handling and the error class.
const contractAdapter: AxiosAdapter = async (config) => {
  const data = await requestBff<unknown>(axios.getUri(config), {
    method: (config.method ?? "get").toUpperCase(),
    headers: config.headers.toJSON() as Record<string, string>,
    body: typeof config.data === "string" ? config.data : undefined,
    signal: (config.signal as AbortSignal | undefined) ?? undefined,
  });
  return {
    data,
    status: data === undefined ? 204 : 200,
    statusText: data === undefined ? "No Content" : "OK",
    headers: {},
    config,
  };
};

export const bffCalendar = getBffCalendar(axios.create({ adapter: contractAdapter, headers: { Accept: "application/json" } }));
