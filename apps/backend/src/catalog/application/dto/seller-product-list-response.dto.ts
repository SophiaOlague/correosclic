export class SellerProductListItemDto {
  id!: string;
  codigoPublico!: string;
  nombre!: string;
  categoria!: { id: string; nombre: string };
  imagenPrincipalUrl!: string | null;
  activo!: boolean;
  publicado!: boolean;
  /** `min(variantes.precio)`; null si el producto aún no tiene variantes. */
  precioDesde!: number | null;
  /** Suma del `stockDisponible` de las variantes activas. */
  stockTotal!: number;
  totalVariantes!: number;
  createdAt!: Date;
}

/** Misma forma de paginación que `OrderListResponseDto`. */
export class SellerProductListResponseDto {
  products!: SellerProductListItemDto[];
  page!: number;
  limit!: number;
  total!: number;
  totalPages!: number;
}
