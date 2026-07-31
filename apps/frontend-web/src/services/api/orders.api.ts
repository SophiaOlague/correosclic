import { http, idempotencyHeader } from '@/services/http';
import type {
  OrderDetailDto,
  OrderListResponseDto,
  OrderSummaryDto,
} from '@/types/order';

/**
 * Endpoints reales de Orders
 * (`apps/backend/src/orders/controllers/orders.controller.ts`).
 * Los tres exigen JWT y acotan por cliente: `GET /orders/:id` responde 404 si
 * el pedido no pertenece a quien lo pide.
 */
export const ordersApi = {
  /**
   * `POST /orders` con `Idempotency-Key` obligatorio.
   *
   * El backend vuelve a ejecutar Checkout internamente
   * (`OrderPreparationService`), así que **el body solo lleva `direccionId`**:
   * ningún importe viaja desde el cliente. Todo ocurre en una transacción:
   * reserva de inventario → creación del pedido en `PENDIENTE_PAGO` → vaciado
   * del carrito.
   *
   * El `scope` identifica el intento: mientras no cambie, un reintento reutiliza
   * la misma clave y el backend devuelve la respuesta ya registrada en lugar de
   * crear un segundo pedido.
   */
  create(scope: string, direccionId?: string): Promise<OrderSummaryDto> {
    return http.post<OrderSummaryDto>(
      '/orders',
      direccionId ? { direccionId } : {},
      { headers: idempotencyHeader(scope) },
    );
  },

  /** `GET /orders?page&limit` — paginado, `limit` máximo 100. */
  list(page: number, limit: number): Promise<OrderListResponseDto> {
    return http.get<OrderListResponseDto>('/orders', {
      query: { page, limit },
    });
  },

  /** `GET /orders/:id` */
  getById(orderId: string): Promise<OrderDetailDto> {
    return http.get<OrderDetailDto>(`/orders/${orderId}`);
  },
};
