export class ProductResponseDto {
  readonly id: string;

  readonly codigoPublico: string;

  readonly nombre: string;

  readonly descripcion?: string;

  readonly activo: boolean;

  readonly publicado: boolean;

  readonly createdAt: Date;
}