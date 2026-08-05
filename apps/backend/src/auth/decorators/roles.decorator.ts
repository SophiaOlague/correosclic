import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Roles (`Rol.codigo`) que pueden ejecutar el endpoint.
 *
 * Se evalúa con `RolesGuard`, que debe declararse **después** de
 * `JwtAuthGuard`: necesita el usuario ya resuelto en la petición.
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
