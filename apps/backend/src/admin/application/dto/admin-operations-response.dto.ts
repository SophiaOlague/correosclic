export class AdminBranchDto {
  id!: string;
  codigo!: string;
  nombre!: string;
  telefono!: string | null;
  email!: string | null;
  activa!: boolean;
  direccionFormateada!: string | null;
  ciudad!: string;
  estado!: string;
  totalEmpleados!: number;
  totalVehiculos!: number;
}

export class AdminVehicleDto {
  id!: string;
  placas!: string;
  marca!: string;
  modelo!: string;
  anio!: number;
  capacidadKg!: number;
  activo!: boolean;
  sucursal!: { id: string; nombre: string };
  /** Repartidor con la asignación vigente, si lo hay. */
  repartidorAsignado!: string | null;
}
