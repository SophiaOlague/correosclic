import { Injectable } from '@nestjs/common';
import { MetodoPago } from '@correosclic/database';

/**
 * Traduce el tipo de método de pago de Stripe a nuestro MetodoPago.
 * Apple Pay / Google Pay no son un `type` propio en Stripe -- llegan como
 * type "card" con el wallet anidado en payment_method.card.wallet.type,
 * por eso se recibe aparte.
 */
@Injectable()
export class StripePaymentMethodMapper {
  fromStripeType(
    stripeType: string,
    walletType?: string | null,
  ): MetodoPago {
    if (stripeType === 'card') {
      if (walletType === 'apple_pay') {
        return MetodoPago.APPLE_PAY;
      }

      if (walletType === 'google_pay') {
        return MetodoPago.GOOGLE_PAY;
      }

      return MetodoPago.CARD;
    }

    if (stripeType === 'oxxo') {
      return MetodoPago.OXXO;
    }

    if (
      stripeType === 'spei' ||
      stripeType === 'customer_balance'
    ) {
      return MetodoPago.SPEI;
    }

    return MetodoPago.OTRO;
  }
}
