import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import { InvalidWebhookSignatureException } from '../../domain/exceptions/invalid-webhook-signature.exception';

@Injectable()
export class StripeWebhookVerifierService {
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.getOrThrow<string>(
        'STRIPE_SECRET_KEY',
      ),
    );

    this.webhookSecret =
      this.configService.getOrThrow<string>(
        'STRIPE_WEBHOOK_SECRET',
      );
  }

  /**
   * @param rawBody bytes crudos del request (no el body parseado por Nest) --
   *   la verificación HMAC de Stripe falla si el body ya pasó por un parser JSON.
   */
  verify(rawBody: Buffer, signature: string): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret,
      );
    } catch {
      throw new InvalidWebhookSignatureException();
    }
  }
}
