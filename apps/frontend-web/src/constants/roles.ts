/**
 * Códigos de rol tal como los define el backend en `Rol.codigo`
 * (ver `packages/database/prisma/seed/roles.seed.ts`).
 * No inventar valores nuevos: deben coincidir exactamente con la base de datos.
 */
export const ROLES = {
  cliente: 'CLIENTE',
  vendedor: 'VENDEDOR',
  repartidor: 'REPARTIDOR',
  recepcion: 'RECEPCION',
  adminLocal: 'ADMIN_LOCAL',
  adminRegional: 'ADMIN_REGIONAL',
  superAdmin: 'SUPER_ADMIN',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
