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
  [ROLES.superAdmin, ROUTES.adminSuper],
  [ROLES.adminRegional, ROUTES.adminRegional],
  [ROLES.adminLocal, ROUTES.adminLocal],
  [ROLES.recepcion, ROUTES.reception],
  [ROLES.repartidor, ROUTES.driver],
  [ROLES.vendedor, ROUTES.sellerDashboard],
  [ROLES.cliente, ROUTES.home],
];

export function landingRouteFor(roles: readonly string[]): string {
  const match = LANDING_BY_ROLE.find(([role]) => roles.includes(role));

  return match ? match[1] : ROUTES.home;
}
