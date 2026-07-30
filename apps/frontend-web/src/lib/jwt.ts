/**
 * Lectura del payload del JWT emitido por el backend.
 *
 * Solo se usa para saber *cuándo* expira la sesión y poder cerrarla antes de
 * que el usuario choque con un 401. La verificación real de la firma es
 * responsabilidad del backend: aquí nunca se confía en el contenido del token
 * para tomar decisiones de autorización.
 */
interface JwtPayload {
  sub?: string;
  email?: string;
  /** Expiración en segundos desde epoch. */
  exp?: number;
  iat?: number;
}

export function decodeJwt(token: string): JwtPayload | null {
  const [, payload] = token.split('.');

  if (!payload) return null;

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));

    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** Momento de expiración en milisegundos, o `null` si el token no lo declara. */
export function getTokenExpiry(token: string): number | null {
  const exp = decodeJwt(token)?.exp;

  return typeof exp === 'number' ? exp * 1000 : null;
}

/**
 * Un token sin `exp` legible se considera válido: que decida el backend.
 * Se descuenta un margen para no usar un token que expira en este instante.
 */
export function isTokenExpired(token: string, skewMs = 5_000): boolean {
  const expiry = getTokenExpiry(token);

  if (expiry === null) return false;

  return Date.now() + skewMs >= expiry;
}
