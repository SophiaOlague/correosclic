import { http, idempotencyHeader } from '@/services/http';
import type { PaymentIntentResponseDto, PaymentStatusDto } from '@/types/payment';

/**
 * Endpoints reales de Payments
 * (`apps/backend/src/payments/controllers/payments.controller.ts`).
 *
 * `POST /payments/webhooks/stripe` no aparece aquí a propósito: lo llama
 * Stripe contra nuestro backend, nunca el navegador.
 */
export const paymentsApi = {
  /**
   * `POST /payments/intent` con `Idempotency-Key` obligatorio.
   *
   * El backend decide si crea un PaymentIntent nuevo o reutiliza el activo
   * (`createOrReuse`): el frontend nunca toma esa decisión. Responde 400 si el
   * pedido no existe, no es del cliente o ya no está en `PENDIENTE_PAGO`.
   */
  createIntent(orderId: string): Promise<PaymentIntentResponseDto> {
    return http.post<PaymentIntentResponseDto>(
      '/payments/intent',
      { orderId },
      { headers: idempotencyHeader(`payment:${orderId}`) },
    );
  },

  /**
   * `GET /payments/order/:orderId` — **única fuente del estado del pago**.
   * Responde 404 mientras no exista ningún pago registrado para el pedido.
   */
  getStatus(orderId: string): Promise<PaymentStatusDto> {
    return http.get<PaymentStatusDto>(`/payments/order/${orderId}`);
  },
};
