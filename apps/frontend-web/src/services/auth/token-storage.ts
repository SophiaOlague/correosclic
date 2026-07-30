import type { AuthenticatedUser } from '@/types/auth';

const TOKEN_KEY = 'correosclic.accessToken';
const USER_KEY = 'correosclic.user';

/**
 * Persistencia de la sesión.
 *
 * El backend firma el JWT con `expiresIn: '1d'` y un payload de `{ sub, email }`
 * (ver `apps/backend/src/auth/auth.module.ts`). El objeto `user` completo —con
 * nombre y roles— solo llega en la respuesta de `/auth/login` y `/auth/register`,
 * por eso se guarda junto al token y así sobrevive a un refresh de página.
 */
export const tokenStorage = {
  getToken(): string | null {
    return safeRead(TOKEN_KEY);
  },

  getUser(): AuthenticatedUser | null {
    const raw = safeRead(USER_KEY);

    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthenticatedUser;
    } catch {
      return null;
    }
  },

  save(token: string, user: AuthenticatedUser): void {
    safeWrite(TOKEN_KEY, token);
    safeWrite(USER_KEY, JSON.stringify(user));
  },

  saveUser(user: AuthenticatedUser): void {
    safeWrite(USER_KEY, JSON.stringify(user));
  },

  clear(): void {
    safeRemove(TOKEN_KEY);
    safeRemove(USER_KEY);
  },
};

function safeRead(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeWrite(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* Modo privado o almacenamiento lleno: la sesión vive solo en memoria. */
  }
}

function safeRemove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* Ver safeWrite. */
  }
}
