import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { ROUTES } from '@/constants/routes';

/**
 * Puente temporal entre el export de Figma y React Router.
 *
 * Las pantallas exportadas navegan con `setView("catalog")` en vez de rutas.
 * Este hook devuelve una función con esa misma firma que traduce el nombre de
 * vista a su ruta real, de modo que ningún cuerpo de pantalla tenga que
 * modificarse hasta que le toque su módulo de migración.
 *
 * TODO: eliminar cuando todas las pantallas usen `<Link>` / `useNavigate`.
 */
const VIEW_TO_ROUTE: Record<string, string> = {
  home: ROUTES.home,
  login: ROUTES.login,
  register: ROUTES.register,
  catalog: ROUTES.catalog,
  // El detalle de producto ya vive en `/producto/:id`: sin un id concreto, lo
  // sensato es llevar al catálogo.
  product: ROUTES.catalog,
  cart: ROUTES.cart,
  checkout: ROUTES.checkout,
  dashboard: ROUTES.account,
  tracking: ROUTES.tracking,
  become_seller: ROUTES.becomeSeller,
  seller_dashboard: ROUTES.sellerDashboard,
  receptionist: ROUTES.reception,
  driver: ROUTES.driver,
  local_admin: ROUTES.adminLocal,
  regional_admin: ROUTES.adminRegional,
  super_admin: ROUTES.adminSuper,
};

export function useViewNavigate(): (view: string) => void {
  const navigate = useNavigate();

  return useCallback(
    (view: string) => {
      navigate(VIEW_TO_ROUTE[view] ?? ROUTES.catalog);
    },
    [navigate],
  );
}
