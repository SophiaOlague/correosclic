import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { getTokenExpiry, isTokenExpired } from '@/lib/jwt';
import { authApi } from '@/services/api/auth.api';
import { tokenStorage } from '@/services/auth/token-storage';
import { UNAUTHORIZED_EVENT } from '@/services/http';
import type { AuthenticatedUser, AuthSession } from '@/types/auth';

export interface AuthContextValue {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  /** `true` mientras se revalida una sesión persistida al arrancar la app. */
  isLoading: boolean;
  signIn: (session: AuthSession, options?: { remember?: boolean }) => void;
  signOut: (options?: { expired?: boolean }) => void;
  hasRole: (...roles: string[]) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

/** Se emite cuando la sesión se cierra por expiración, no por decisión del usuario. */
export const SESSION_EXPIRED_EVENT = 'correosclic:session-expired';

/** Descarta de entrada un token ya vencido, para no arrancar con sesión falsa. */
function readStoredSession(): { token: string; user: AuthenticatedUser | null } | null {
  const token = tokenStorage.getToken();

  if (!token) return null;

  if (isTokenExpired(token)) {
    tokenStorage.clear();
    return null;
  }

  return { token, user: tokenStorage.getUser() };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const [stored, setStored] = useState(readStoredSession);
  const [user, setUser] = useState<AuthenticatedUser | null>(() => stored?.user ?? null);

  const token = stored?.token ?? null;

  /**
   * Revalida la sesión persistida contra `GET /auth/ping`. Sirve para dos cosas:
   * confirmar que el token sigue siendo válido para el servidor y traer los
   * roles vigentes, que pueden haber cambiado desde el último login.
   */
  const { data: verifiedUser, isLoading: isVerifying } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    enabled: token !== null,
    retry: false,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (verifiedUser) {
      setUser(verifiedUser);
      tokenStorage.saveUser(verifiedUser);
    }
  }, [verifiedUser]);

  const signOut = useCallback(
    (options?: { expired?: boolean }) => {
      tokenStorage.clear();
      setStored(null);
      setUser(null);
      queryClient.removeQueries({ queryKey: ['auth'] });
      // El resto de datos en caché pertenecen al usuario que se va.
      queryClient.clear();

      if (options?.expired) {
        window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
      }
    },
    [queryClient],
  );

  const signIn = useCallback(
    (session: AuthSession, options?: { remember?: boolean }) => {
      tokenStorage.save(session.accessToken, session.user, options?.remember ? 'local' : 'session');
      setStored({ token: session.accessToken, user: session.user });
      setUser(session.user);
      queryClient.setQueryData(['auth', 'me'], session.user);
    },
    [queryClient],
  );

  /**
   * Cierre proactivo al expirar el JWT (el backend lo firma con `expiresIn: '1d'`).
   * Sin esto, el usuario seguiría viendo la interfaz de sesión iniciada hasta
   * que una petición fallara con 401.
   */
  useEffect(() => {
    if (!token) return;

    const expiry = getTokenExpiry(token);

    if (expiry === null) return;

    const timeout = window.setTimeout(
      () => signOut({ expired: true }),
      Math.max(0, expiry - Date.now()),
    );

    return () => window.clearTimeout(timeout);
  }, [token, signOut]);

  // Un 401 desde cualquier petición: el cliente HTTP ya limpió el
  // almacenamiento, aquí solo se sincroniza el estado de React.
  useEffect(() => {
    const onUnauthorized = () => {
      setStored(null);
      setUser(null);
      queryClient.clear();
    };

    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);

    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [queryClient]);

  const hasRole = useCallback(
    (...roles: string[]) =>
      roles.length === 0 || roles.some((role) => user?.roles.includes(role)),
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null && token !== null,
      isLoading: token !== null && user === null && isVerifying,
      signIn,
      signOut,
      hasRole,
    }),
    [user, token, isVerifying, signIn, signOut, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
