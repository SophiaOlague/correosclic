import { http } from '@/services/http';
import type { AddCartItemPayload, CartDto } from '@/types/cart';

/**
 * Endpoints reales del carrito
 * (`apps/backend/src/shoppping-cart/controllers/shopping-cart.controller.ts`).
 *
 * Todos exigen JWT y **todos devuelven el carrito completo ya recalculado**,
 * así que la interfaz nunca necesita reconstruir totales por su cuenta: basta
 * con guardar la respuesta en la caché de TanStack Query.
 */
export const cartApi = {
  /** `GET /cart` */
  get(): Promise<CartDto> {
    return http.get<CartDto>('/cart');
  },

  /**
   * `POST /cart/items`
   *
   * Si la variante ya está en el carrito, el backend **suma** la cantidad a la
   * existente y valida el total contra el stock disponible.
   */
  addItem(payload: AddCartItemPayload): Promise<CartDto> {
    return http.post<CartDto>('/cart/items', payload);
  },

  /** `PATCH /cart/items/:itemId` — fija la cantidad, no la incrementa. */
  updateItem(itemId: string, cantidad: number): Promise<CartDto> {
    return http.patch<CartDto>(`/cart/items/${itemId}`, { cantidad });
  },

  /** `DELETE /cart/items/:itemId` */
  removeItem(itemId: string): Promise<CartDto> {
    return http.delete<CartDto>(`/cart/items/${itemId}`);
  },

  /** `DELETE /cart` — vacía el carrito sin borrarlo. */
  clear(): Promise<CartDto> {
    return http.delete<CartDto>('/cart');
  },
};
