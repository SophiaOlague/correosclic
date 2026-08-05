import { ROLES } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';

/**
 * Destino tras iniciar sesión cuando el usuario no venía de una ruta concreta.
 *
 * El orden importa: un usuario puede acumular varios roles (por ejemplo
 * CLIENTE + VENDEDOR, que es lo normal tras aprobarse una solicitud de venta),
 * y se le lleva al panel de mayor responsabilidad.
 */
const LANDING_BY_ROLE: readonly (readonly [string, string])[] = [
  [ROLES.superAdmin, ROUTES.adminSellerRequests],
  /*
   * `ADMIN_REGIONAL` y `ADMIN_LOCAL` aterrizan en "Mi cuenta", no en el panel.
   *
   * No tienen todavía ninguna funcionalidad propia y los nueve endpoints de
   * `admin/` exigen `SUPER_ADMIN`, así que mandarlos a `/admin/solicitudes`
   * sería llevarlos a un 403 seguro. Se actualizará cuando existan sus paneles.
   */
  [ROLES.adminRegional, ROUTES.account],
  [ROLES.adminLocal, ROUTES.account],
  [ROLES.recepcion, ROUTES.reception],
  [ROLES.repartidor, ROUTES.driver],
  [ROLES.vendedor, ROUTES.sellerDashboard],
  [ROLES.cliente, ROUTES.home],
];

export function landingRouteFor(roles: readonly string[]): string {
  const match = LANDING_BY_ROLE.find(([role]) => roles.includes(role));

  return match ? match[1] : ROUTES.home;
}
