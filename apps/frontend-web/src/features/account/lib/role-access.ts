import {
  Package,
  PackageCheck,
  ShieldCheck,
  Store,
  Truck,
  type LucideIcon,
} from 'lucide-react';

import { ROLES } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';

/**
 * Accesos que ofrece "Mi cuenta", uno por rol.
 *
 * Solo se listan destinos que existen y a los que el usuario puede entrar de
 * verdad: cada ruta está protegida por `RoleRoute` con exactamente este rol,
 * porque el backend no define ninguna jerarquía entre ellos.
 *
 * `ADMIN_LOCAL` y `ADMIN_REGIONAL` no aparecen: no tienen ninguna pantalla
 * propia todavía y `admin/` solo abre a `SUPER_ADMIN`, así que ofrecerles una
 * entrada sería mandarlos a un 403.
 */
export interface RoleAccess {
  role: string;
  to: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const ROLE_ACCESSES: readonly RoleAccess[] = [
  {
    role: ROLES.cliente,
    to: ROUTES.orders,
    label: 'Mis pedidos',
    description: 'Historial de compras, detalle y seguimiento de cada envío.',
    icon: Package,
  },
  {
    role: ROLES.vendedor,
    to: ROUTES.sellerDashboard,
    label: 'Panel de vendedor',
    description: 'Tu tienda, tu catálogo y los envíos que debes llevar a sucursal.',
    icon: Store,
  },
  {
    role: ROLES.recepcion,
    to: ROUTES.reception,
    label: 'Recepción',
    description: 'Certifica en qué estado llegan los paquetes a tu sucursal.',
    icon: PackageCheck,
  },
  {
    role: ROLES.repartidor,
    to: ROUTES.driver,
    label: 'Repartidor',
    description: 'Tus entregas asignadas y el registro de cada intento.',
    icon: Truck,
  },
  {
    role: ROLES.superAdmin,
    to: ROUTES.adminSellerRequests,
    label: 'Administración',
    description: 'Solicitudes de vendedor, red operativa y configuración del sistema.',
    icon: ShieldCheck,
  },
];

/** Nombre legible de cada `Rol.codigo` del backend. */
const ROLE_LABELS: Record<string, string> = {
  [ROLES.cliente]: 'Cliente',
  [ROLES.vendedor]: 'Vendedor',
  [ROLES.repartidor]: 'Repartidor',
  [ROLES.recepcion]: 'Recepción',
  [ROLES.adminLocal]: 'Administrador local',
  [ROLES.adminRegional]: 'Administrador regional',
  [ROLES.superAdmin]: 'Super administrador',
};

export function roleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role;
}
