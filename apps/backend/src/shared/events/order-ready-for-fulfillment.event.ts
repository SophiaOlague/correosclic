export const ORDER_READY_FOR_FULFILLMENT_EVENT = 'order.ready_for_fulfillment';

/**
 * Único punto de acoplamiento entre Payments/Orders y Logistics. Representa
 * el hecho de dominio "este pedido ya puede empezar a surtirse", desacoplado
 * a propósito del mecanismo de cobro (Stripe hoy, lo que sea después).
 */
export class OrderReadyForFulfillmentEvent {
  constructor(public readonly pedidoId: string) {}
}
