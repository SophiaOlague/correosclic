import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';

import { ROUTES } from '@/constants/routes';
import { UNAUTHORIZED_EVENT } from '@/services/http';

import { SESSION_EXPIRED_EVENT } from './AuthProvider';

/** Rutas públicas desde las que no tiene sentido empujar al login. */
const PUBLIC_PATHS: readonly string[] = [
  ROUTES.home,
  ROUTES.catalog,
  ROUTES.product,
  ROUTES.login,
  ROUTES.register,
];

/**
 * Avisa al usuario cuando su sesión caduca y, si estaba en una zona privada,
 * lo lleva al login conservando la ruta para volver después.
 *
 * Vive dentro del router porque necesita `useNavigate`, y por eso está separado
 * de `AuthProvider`, que se monta por encima.
 */
export function SessionExpiryWatcher() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Dos caminos llevan aquí: el temporizador que se adelanta al `exp` del
    // JWT, y un 401 del backend cuando el token ya no sirve.
    const onExpired = () => {
      toast.warning('Tu sesión expiró. Inicia sesión de nuevo.');

      if (!PUBLIC_PATHS.includes(location.pathname)) {
        navigate(ROUTES.login, { replace: true, state: { from: location.pathname } });
      }
    };

    const onUnauthorized = () => {
      if (!PUBLIC_PATHS.includes(location.pathname)) {
        navigate(ROUTES.login, { replace: true, state: { from: location.pathname } });
      }
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
      window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    };
  }, [navigate, location.pathname]);

  return null;
}
