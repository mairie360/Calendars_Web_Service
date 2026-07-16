import { getStoredAuthorizationHeader } from "./auth-token";

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

function createRequestHeaders(init: RequestInit) {
  const headers = new Headers(init.headers);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!headers.has("Authorization")) {
    const authorizationHeader = getStoredAuthorizationHeader();

    if (authorizationHeader) {
      headers.set("Authorization", authorizationHeader);
    }
  }

  return headers;
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

  return `Erreur BFF (${status})`;
}

export async function requestBff<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`/api/bff${path}`, {
    ...init,
    headers: createRequestHeaders(init),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await readResponseBody(response);
    throw new BffRequestError(response.status, getErrorMessage(response.status, body), body);
  }

  if (response.status === 204) return undefined as T;

  return (await readResponseBody(response)) as T;
}
