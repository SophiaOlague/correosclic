export class ShoppingCartItemDto {
  id: string;

  productoVarianteId: string;

  nombreProducto: string;

  sku: string;

  imagenPrincipalUrl: string | null;

  precioUnitario: number;

  cantidad: number;

  stockDisponible: number;

  disponible: boolean;

  subtotal: number;
}