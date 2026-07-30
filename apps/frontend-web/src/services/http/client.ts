import { API_URL } from '@/constants/env';
import { tokenStorage } from '@/services/auth/token-storage';

import { NetworkError, toApiError } from './errors';

type Query = Record<string, string | number | boolean | undefined | null>;

interface RequestOptions {
  /** Parámetros de query string; los `undefined`/`null` se omiten. */
  query?: Query;
  /** Cabeceras extra, p. ej. `Idempotency-Key`. */
  headers?: Record<string, string>;
  /** Omite el header `Authorization` aunque exista sesión (login/registro). */
  skipAuth?: boolean;
  signal?: AbortSignal;
}

/** Se dispara cuando el backend responde 401 con una sesión activa. */
export const UNAUTHORIZED_EVENT = 'correosclic:unauthorized';

/**
 * Cliente HTTP único de la aplicación.
 *
 * Ningún componente ni hook debe llamar a `fetch` directamente: todo pasa por
 * aquí y, encima, por un módulo de `services/api/*`.
 */
async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const url = buildUrl(path, options.query);

  const headers: Record<string, string> = { ...options.headers };

  const isFormData = body instanceof FormData;

  // El navegador debe fijar el boundary de multipart por su cuenta.
  if (body !== undefined && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (!options.skipAuth) {
    const token = tokenStorage.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
      signal: options.signal,
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
    throw new NetworkError(cause);
  }

  if (!response.ok) {
    const payload = await readBody(response);

    if (response.status === 401 && !options.skipAuth) {
      tokenStorage.clear();
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    }

    throw toApiError(response.status, payload);
  }

  // 204 y respuestas sin cuerpo.
  if (response.status === 204) return undefined as T;

  return (await readBody(response)) as T;
}

function buildUrl(path: string, query?: Query): string {
  const base = `${API_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

  if (!query) return base;

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  }

  const serialized = params.toString();

  return serialized ? `${base}?${serialized}` : base;
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>('GET', path, undefined, options),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, body, options),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, body, options),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, body, options),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>('DELETE', path, undefined, options),
};
