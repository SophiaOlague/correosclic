import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { toast } from 'sonner';

import { FullPageLoader } from '@/components/common/PageLoader';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';

import { landingRouteFor } from '@/features/auth/lib/role-landing';

/**
 * Exige sesión activa.
 *
 * Mientras se revalida una sesión persistida contra `GET /auth/ping` se muestra
 * un loader: redirigir antes de saber el resultado expulsaría al usuario de su
 * propia sesión en cada recarga de página.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullPageLoader label="Verificando tu sesión..." />;

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

/**
 * Exige sesión activa y al menos uno de los roles indicados.
 * Los códigos vienen de `AuthenticatedUserDto.roles` (ver `@/constants/roles`).
 */
export function RoleRoute({ roles }: { roles: readonly string[] }) {
  const { isAuthenticated, isLoading, hasRole, user } = useAuth();
  const location = useLocation();

  const isAllowed = isAuthenticated && hasRole(...roles);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isAllowed) {
      // `id` fijo: evita avisos duplicados si el efecto se vuelve a ejecutar.
      toast.error('No tienes permiso para acceder a esta sección.', { id: 'role-denied' });
    }
  }, [isLoading, isAuthenticated, isAllowed]);

  if (isLoading) return <FullPageLoader label="Verificando tu sesión..." />;

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />;
  }

  if (!isAllowed) {
    return <Navigate to={landingRouteFor(user?.roles ?? [])} replace />;
  }

  return <Outlet />;
}

/**
 * Inverso de `ProtectedRoute`: impide volver a login o registro con la sesión
 * ya iniciada y manda al panel que corresponde por rol.
 */
export function GuestRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <FullPageLoader label="Verificando tu sesión..." />;

  if (isAuthenticated) {
    return <Navigate to={landingRouteFor(user?.roles ?? [])} replace />;
  }

  return <Outlet />;
}
