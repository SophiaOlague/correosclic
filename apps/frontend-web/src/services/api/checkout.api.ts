import { http } from '@/services/http';
import type { CheckoutAddressDto, CheckoutSummaryDto } from '@/types/checkout';

/**
 * Endpoints reales de Checkout
 * (`apps/backend/src/checkout/controllers/checkout.controller.ts`).
 *
 * Son solo dos, ambos de lectura y ambos con JWT. Checkout **no crea nada**:
 * el pedido lo crea `POST /orders` (Módulo 5) y el cobro lo inicia
 * `POST /payments/intent` (Módulo 6).
 */
export const checkoutApi = {
  /**
   * `GET /checkout?direccionId=`
   *
   * Sin `direccionId` el backend usa la dirección principal del cliente. La
   * respuesta incluye `direccionId` con la que efectivamente cotizó.
   */
  getSummary(direccionId?: string): Promise<CheckoutSummaryDto> {
    return http.get<CheckoutSummaryDto>('/checkout', {
      query: { direccionId },
    });
  },

  /** `GET /checkout/addresses` — direcciones de entrega del cliente. */
  listAddresses(): Promise<CheckoutAddressDto[]> {
    return http.get<CheckoutAddressDto[]>('/checkout/addresses');
  },
};
