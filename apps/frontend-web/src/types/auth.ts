/**
 * Espejo de `AuthenticatedUserDto`
 * (`apps/backend/src/auth/dto/authenticated-user.dto.ts`).
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  roles: string[];
}

/**
 * Respuesta de `POST /auth/login` y `POST /auth/register`.
 * Espejo de `RegisterResponseDto`.
 */
export interface AuthSession {
  accessToken: string;
  user: AuthenticatedUser;
}
