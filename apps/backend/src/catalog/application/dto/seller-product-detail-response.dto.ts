export class SellerProductImageDto {
  id!: string;
  url!: string;
  orden!: number;
  esPrincipal!: boolean;
}

export class SellerVariantAttributeDto {
  atributoId!: string;
  atributo!: string;
  valorId!: string;
  valor!: string;
}

export class SellerProductVariantDto {
  id!: string;
  sku!: string;
  precio!: number;
  pesoKg!: number | null;
  activa!: boolean;
  /** null mientras la variante no tenga inventario creado. */
  stockDisponible!: number | null;
  stockReservado!: number | null;
  stockMinimo!: number | null;
  atributos!: SellerVariantAttributeDto[];
}

export class SellerProductDetailResponseDto {
  id!: string;
  codigoPublico!: string;
  nombre!: string;
  descripcion!: string | null;
  pesoKg!: number;
  altoCm!: number | null;
  anchoCm!: number | null;
  largoCm!: number | null;
  activo!: boolean;
  publicado!: boolean;
  createdAt!: Date;
  categoria!: { id: string; nombre: string };
  imagenes!: SellerProductImageDto[];
  variantes!: SellerProductVariantDto[];
}
