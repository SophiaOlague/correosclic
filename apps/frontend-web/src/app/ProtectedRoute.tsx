import { Navigate, Outlet, useLocation } from 'react-router';

import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';

/**
 * Exige sesión activa. Guarda la ruta pedida en el `state` para poder volver
 * a ella después del login.
 */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

/**
 * Exige sesión activa y al menos uno de los roles indicados.
 *
 * Los códigos de rol vienen del backend en `AuthenticatedUserDto.roles`
 * (ver `@/constants/roles`).
 */
export function RoleRoute({ roles }: { roles: readonly string[] }) {
  const { isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />;
  }

  if (!hasRole(...roles)) {
    return <Navigate to={ROUTES.home} replace />;
  }

  return <Outlet />;
}
