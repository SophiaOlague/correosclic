import {
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';

import { StripeWebhookVerifierService } from '../infrastructure/stripe/stripe-webhook-verifier.service';
import { WebhookProcessorService } from '../application/services/webhook-processor.service';

import { InvalidWebhookSignatureException } from '../domain/exceptions/invalid-webhook-signature.exception';

/**
 * Sin JwtAuthGuard a propósito: Stripe llama esta ruta directamente, sin
 * JWT -- la autenticación es la firma HMAC del header Stripe-Signature.
 * Vive en su propio controller (no en PaymentsController) para que no haya
 * que acordarse de "exentar" esta ruta de un guard aplicado a nivel de clase.
 */
@Controller('payments/webhooks')
export class PaymentsWebhookController {
  constructor(
    private readonly webhookVerifier: StripeWebhookVerifierService,
    private readonly webhookProcessor: WebhookProcessorService,
  ) {}

  @Post('stripe')
  @HttpCode(200)
  async handleStripeWebhook(
    @Req()
    request: RawBodyRequest<Request>,

    @Headers('stripe-signature')
    signature: string,
  ): Promise<{ received: boolean }> {
    if (!request.rawBody || !signature) {
      throw new InvalidWebhookSignatureException();
    }

    const event = this.webhookVerifier.verify(
      request.rawBody,
      signature,
    );

    await this.webhookProcessor.process(event);

    return {
      received: true,
    };
  }
}
