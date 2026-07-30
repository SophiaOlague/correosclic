import type { AuthenticatedUser } from '@/types/auth';

const TOKEN_KEY = 'correosclic.accessToken';
const USER_KEY = 'correosclic.user';

/**
 * Persistencia de la sesión.
 *
 * El backend firma el JWT con `expiresIn: '1d'` y un payload de `{ sub, email }`
 * (ver `apps/backend/src/auth/auth.module.ts`). El objeto `user` completo —con
 * nombre y roles— llega en la respuesta de `/auth/login` y `/auth/register`, y
 * se guarda junto al token para tener los datos disponibles de inmediato al
 * arrancar la aplicación; `/auth/ping` los revalida contra el servidor.
 *
 * El destino depende de "Recordarme": `localStorage` si el usuario lo marca
 * (la sesión sobrevive al cierre del navegador) y `sessionStorage` si no.
 */
type Persistence = 'local' | 'session';

export const tokenStorage = {
  getToken(): string | null {
    return read(TOKEN_KEY);
  },

  getUser(): AuthenticatedUser | null {
    const raw = read(USER_KEY);

    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthenticatedUser;
    } catch {
      return null;
    }
  },

  save(token: string, user: AuthenticatedUser, persistence: Persistence = 'local'): void {
    // Se limpian ambos almacenes para que cambiar de "Recordarme" entre
    // sesiones no deje un token huérfano en el otro.
    this.clear();

    const store = storeFor(persistence);

    write(store, TOKEN_KEY, token);
    write(store, USER_KEY, JSON.stringify(user));
  },

  /** Actualiza el usuario sin tocar el token ni cambiar de almacén. */
  saveUser(user: AuthenticatedUser): void {
    const store = read(TOKEN_KEY, 'local') !== null ? storeFor('local') : storeFor('session');

    write(store, USER_KEY, JSON.stringify(user));
  },

  clear(): void {
    for (const store of stores()) {
      try {
        store?.removeItem(TOKEN_KEY);
        store?.removeItem(USER_KEY);
      } catch {
        /* Almacenamiento no disponible. */
      }
    }
  },
};

function stores(): (Storage | null)[] {
  return [storeFor('local'), storeFor('session')];
}

function storeFor(persistence: Persistence): Storage | null {
  try {
    return persistence === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function read(key: string, only?: Persistence): string | null {
  const candidates = only ? [storeFor(only)] : stores();

  for (const store of candidates) {
    try {
      const value = store?.getItem(key);
      if (value !== null && value !== undefined) return value;
    } catch {
      /* Modo privado: se intenta el siguiente almacén. */
    }
  }

  return null;
}

function write(store: Storage | null, key: string, value: string): void {
  try {
    store?.setItem(key, value);
  } catch {
    /* Modo privado o almacenamiento lleno: la sesión vive solo en memoria. */
  }
}
