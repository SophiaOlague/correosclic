export class ProductVariantResponseDto {

  readonly id: string;

  readonly sku: string;

  readonly precio: number;

  readonly pesoKg?: number;

  readonly activa: boolean;

  readonly createdAt: Date;

}