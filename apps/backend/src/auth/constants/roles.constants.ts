/**
 * Códigos de `Rol.codigo` tal como los siembra
 * `packages/database/prisma/seed/roles.seed.ts`.
 */
export const ROLES = {
  CLIENTE: 'CLIENTE',
  VENDEDOR: 'VENDEDOR',
  REPARTIDOR: 'REPARTIDOR',
  RECEPCION: 'RECEPCION',
  ADMIN_LOCAL: 'ADMIN_LOCAL',
  ADMIN_REGIONAL: 'ADMIN_REGIONAL',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;
