import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { PaymentsController } from './controllers/payments.controller';
import { PaymentsWebhookController } from './controllers/payments-webhook.controller';

import { PaymentIntentService } from './application/services/payment-intent.service';
import { WebhookProcessorService } from './application/services/webhook-processor.service';

import { StripeClientService } from './infrastructure/stripe/stripe-client.service';
import { StripeWebhookVerifierService } from './infrastructure/stripe/stripe-webhook-verifier.service';

import { StripeStatusMapper } from './domain/services/stripe-status-mapper';
import { StripePaymentMethodMapper } from './domain/services/stripe-payment-method-mapper';
import { PaymentStateTransitionPolicy } from './domain/services/payment-state-transition-policy';

import { PaymentRepository } from './infrastructure/repositories/payment.repository';
import { WebhookEventRepository } from './infrastructure/repositories/webhook-event.repository';

@Module({
  imports: [PrismaModule],
  controllers: [
    PaymentsController,
    PaymentsWebhookController,
  ],
  providers: [
    PaymentIntentService,
    WebhookProcessorService,
    StripeClientService,
    StripeWebhookVerifierService,
    StripeStatusMapper,
    StripePaymentMethodMapper,
    PaymentStateTransitionPolicy,
    PaymentRepository,
    WebhookEventRepository,
  ],
})
export class PaymentsModule {}
