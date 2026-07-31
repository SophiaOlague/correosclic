/**
 * Contratos del carrito. A diferencia del catálogo, estos **sí** corresponden a
 * endpoints reales: son el espejo de
 * `apps/backend/src/shoppping-cart/application/dto/`.
 */

/** Espejo de `ShoppingCartItemDto`. */
export interface CartItemDto {
  id: string;
  productoVarianteId: string;
  nombreProducto: string;
  sku: string;
  imagenPrincipalUrl: string | null;
  precioUnitario: number;
  cantidad: number;
  stockDisponible: number;
  /** `false` cuando la variante se desactivó o se quedó sin stock. */
  disponible: boolean;
  subtotal: number;
}

/** Espejo de `ShoppingCartDto`. `id` es `null` si el cliente aún no tiene carrito. */
export interface CartDto {
  id: string | null;
  items: CartItemDto[];
  subtotal: number;
  total: number;
}

/** Body de `POST /cart/items`. */
export interface AddCartItemPayload {
  productoVarianteId: string;
  cantidad: number;
}
