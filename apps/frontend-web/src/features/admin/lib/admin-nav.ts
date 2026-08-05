import { Building, Car, FileSearch, Settings, type LucideIcon } from 'lucide-react';

import { ROUTES } from '@/constants/routes';

/**
 * Secciones del panel administrativo.
 *
 * El sidebar del export de Figma tenía 22 entradas repartidas en cinco grupos
 * —usuarios, clientes, vendedores, admins, recepcionistas, repartidores,
 * regiones, pedidos, envíos, incidencias, reportes, auditoría...—. De todas
 * ellas **solo estas cuatro tienen endpoints** en `apps/backend/src/admin`; el
 * resto se retiró en vez de dejar entradas que no llevan a ninguna parte.
 */
export interface AdminNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Coincidencia por prefijo: el detalle mantiene marcada su sección. */
  match: string;
}

export interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV: readonly AdminNavSection[] = [
  {
    title: 'REVISIÓN',
    items: [
      {
        to: ROUTES.adminSellerRequests,
        label: 'Solicitudes de vendedor',
        icon: FileSearch,
        match: ROUTES.adminSellerRequests,
      },
    ],
  },
  {
    title: 'RED OPERATIVA',
    items: [
      {
        to: ROUTES.adminBranches,
        label: 'Sucursales',
        icon: Building,
        match: ROUTES.adminBranches,
      },
      {
        to: ROUTES.adminVehicles,
        label: 'Vehículos',
        icon: Car,
        match: ROUTES.adminVehicles,
      },
    ],
  },
  {
    title: 'SISTEMA',
    items: [
      {
        to: ROUTES.adminSystemConfig,
        label: 'Configuración',
        icon: Settings,
        match: ROUTES.adminSystemConfig,
      },
    ],
  },
];
