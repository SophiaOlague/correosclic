/**
 * Claves de idempotencia para los endpoints que las exigen:
 * `POST /orders` y `POST /payments/intent`
 * (ver `IdempotencyInterceptor` en el backend).
 *
 * La clave debe sobrevivir a un reintento del mismo intento lógico: si el
 * usuario pulsa "Pagar" y la red falla, el reintento tiene que reutilizar la
 * misma clave para que el backend devuelva la respuesta ya registrada en lugar
 * de crear un segundo pedido. Por eso se persiste en `sessionStorage` bajo un
 * `scope` estable (p. ej. `order:<carritoId>` o `payment:<orderId>`).
 */
const PREFIX = 'correosclic.idempotency:';

export function idempotencyKeyFor(scope: string): string {
  const storageKey = `${PREFIX}${scope}`;

  try {
    const existing = window.sessionStorage.getItem(storageKey);
    if (existing) return existing;

    const created = crypto.randomUUID();
    window.sessionStorage.setItem(storageKey, created);

    return created;
  } catch {
    return crypto.randomUUID();
  }
}

/** Se llama cuando la operación termina de forma definitiva (éxito o descarte). */
export function releaseIdempotencyKey(scope: string): void {
  try {
    window.sessionStorage.removeItem(`${PREFIX}${scope}`);
  } catch {
    /* sessionStorage no disponible: nada que limpiar. */
  }
}

/** Cabecera lista para pasar a `http.post(..., { headers })`. */
export function idempotencyHeader(scope: string): Record<string, string> {
  return { 'Idempotency-Key': idempotencyKeyFor(scope) };
}
