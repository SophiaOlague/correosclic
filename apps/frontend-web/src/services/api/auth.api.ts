import { http } from '@/services/http';
import type { AuthenticatedUser, AuthSession } from '@/types/auth';

/**
 * Endpoints reales del módulo `auth` del backend
 * (`apps/backend/src/auth/controllers/auth.controller.ts`).
 *
 * No existe refresh token, ni recuperación de contraseña, ni OAuth: lo que hay
 * es exactamente lo de abajo.
 */
export interface LoginPayload {
  email: string;
  password: string;
}

/** Espejo exacto de `RegisterDto`. Enviar cualquier campo extra provoca un 400. */
export interface RegisterPayload {
  email: string;
  password: string;
  confirmPassword: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  telefono?: string;
  acceptTerms: boolean;
}

export const authApi = {
  /** `POST /auth/login` — público. */
  login(payload: LoginPayload): Promise<AuthSession> {
    return http.post<AuthSession>('/auth/login', payload, { skipAuth: true });
  },

  /** `POST /auth/register` — público. Devuelve la sesión ya iniciada. */
  register(payload: RegisterPayload): Promise<AuthSession> {
    return http.post<AuthSession>('/auth/register', payload, { skipAuth: true });
  },

  /**
   * `GET /auth/ping` — requiere JWT. Devuelve `AuthenticatedUserDto` con el
   * nombre y los roles vigentes, así que sirve para revalidar la sesión al
   * arrancar la aplicación y para detectar un token ya expirado.
   */
  me(): Promise<AuthenticatedUser> {
    return http.get<AuthenticatedUser>('/auth/ping');
  },
};
