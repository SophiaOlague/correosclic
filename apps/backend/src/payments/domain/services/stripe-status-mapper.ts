import { Injectable } from '@nestjs/common';
import { EstadoPago } from '@correosclic/database';
import type Stripe from 'stripe';

/**
 * Traduce el PaymentIntent de Stripe a nuestro EstadoPago. Nota: Stripe no
 * tiene un status "failed" -- un intento fallido se detecta por
 * last_payment_error estando presente mientras el status volvió a
 * requires_payment_method. Por eso el mapper recibe el PaymentIntent
 * completo, no solo el string de status.
 */
@Injectable()
export class StripeStatusMapper {
  map(paymentIntent: Stripe.PaymentIntent): EstadoPago {
    if (
      paymentIntent.status === 'requires_payment_method' &&
      paymentIntent.last_payment_error
    ) {
      return EstadoPago.FALLIDO;
    }

    switch (paymentIntent.status) {
      case 'requires_payment_method':
      case 'requires_confirmation':
        return EstadoPago.PENDIENTE;

      case 'requires_action':
        return EstadoPago.REQUIERE_ACCION;

      case 'processing':
      case 'requires_capture':
        return EstadoPago.PROCESANDO;

      case 'succeeded':
        return EstadoPago.EXITOSO;

      case 'canceled':
        return EstadoPago.CANCELADO;

      default:
        return EstadoPago.PENDIENTE;
    }
  }
}
