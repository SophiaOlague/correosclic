import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { tokenStorage } from '@/services/auth/token-storage';
import { UNAUTHORIZED_EVENT } from '@/services/http';
import type { AuthenticatedUser, AuthSession } from '@/types/auth';

export interface AuthContextValue {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  /** Registra la sesión devuelta por `/auth/login` o `/auth/register`. */
  signIn: (session: AuthSession) => void;
  signOut: () => void;
  hasRole: (...roles: string[]) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(() =>
    tokenStorage.getToken() ? tokenStorage.getUser() : null,
  );

  const signIn = useCallback((session: AuthSession) => {
    tokenStorage.save(session.accessToken, session.user);
    setUser(session.user);
  }, []);

  const signOut = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  // El cliente HTTP ya limpió el almacenamiento; aquí solo se sincroniza el
  // estado de React para que las rutas protegidas reaccionen.
  useEffect(() => {
    const onUnauthorized = () => setUser(null);

    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);

    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const hasRole = useCallback(
    (...roles: string[]) =>
      roles.length === 0 || roles.some((role) => user?.roles.includes(role)),
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      signIn,
      signOut,
      hasRole,
    }),
    [user, signIn, signOut, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
