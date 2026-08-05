/**
 * Contratos de Payments. Espejo de
 * `apps/backend/src/payments/application/dto/`.
 *
 * **El estado que muestra la aplicación siempre sale de aquí**, nunca del SDK
 * de Stripe: Stripe le responde al navegador, pero quien decide que un pago fue
 * exitoso es nuestro webhook al procesarlo en el backend.
 */

/** Valores de `EstadoPago` en Prisma. */
export const PAYMENT_STATES = [
  'PENDIENTE',
  'REQUIERE_ACCION',
  'PROCESANDO',
  'EXITOSO',
  'FALLIDO',
  'CANCELADO',
  'REEMBOLSADO',
] as const;

export type PaymentState = (typeof PAYMENT_STATES)[number];

/** Estados en los que ya no tiene sentido seguir consultando. */
const TERMINAL_STATES: readonly string[] = ['EXITOSO', 'FALLIDO', 'CANCELADO', 'REEMBOLSADO'];

export function isTerminalPaymentState(estado: string): boolean {
  return TERMINAL_STATES.includes(estado);
}

/** Respuesta de `POST /payments/intent`. */
export interface PaymentIntentResponseDto {
  paymentId: string;
  paymentIntentId: string;
  /** Solo se usa para montar Stripe Elements. Nunca se persiste. */
  clientSecret: string;
  status: string;
  amount: number;
  currency: string;
}

/** Respuesta de `GET /payments/order/:orderId`. */
export interface PaymentStatusDto {
  paymentId: string;
  paymentIntentId: string | null;
  status: string;
  amount: number;
  currency: string;
  metodoPago: string | null;
  /** Motivo del rechazo que registró el webhook, si lo hubo. */
  mensajeError: string | null;
}
