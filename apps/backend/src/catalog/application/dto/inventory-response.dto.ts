export class InventoryResponseDto {

  readonly id: string;

  readonly productoVarianteId: string;

  readonly stockDisponible: number;

  readonly stockReservado: number;

  readonly stockMinimo: number;

  readonly createdAt: Date;

}