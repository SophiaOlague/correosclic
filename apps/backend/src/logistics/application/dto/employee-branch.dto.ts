/**
 * Sucursal a la que está adscrito el empleado autenticado.
 *
 * Las colas de sucursal (`reception-queue`, `dispatch-queue`) y el reintento
 * de planificación reciben el `sucursalId` en la ruta y comprueban que quien
 * pregunta sea empleado activo de esa misma sucursal. Sin este endpoint no
 * había forma de conocer ese identificador desde fuera del backend.
 *
 * Vive en Logistics y no en `AuthenticatedUserDto` a propósito: la adscripción
 * a sucursal solo la necesitan las operaciones logísticas, y añadirla al DTO
 * de sesión obligaría a `JwtStrategy` a resolver un `Empleado` en cada
 * petición de cualquier usuario.
 */
export class EmployeeBranchDto {
  empleadoId!: string;
  puesto!: string;
  sucursalId!: string;
  codigo!: string;
  nombre!: string;
}
