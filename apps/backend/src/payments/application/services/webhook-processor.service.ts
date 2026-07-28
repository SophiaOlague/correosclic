import { Injectable, Logger } from '@nestjs/common';
import { EstadoPago, MetodoPago } from '@correosclic/database';
import type Stripe from 'stripe';

import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';
import { WebhookEventRepository } from '../../infrastructure/repositories/webhook-event.repository';
import { StripeClientService } from '../../infrastructure/stripe/stripe-client.service';

import { StripeStatusMapper } from '../../domain/services/stripe-status-mapper';
import { StripePaymentMethodMapper } from '../../domain/services/stripe-payment-method-mapper';
import { PaymentStateTransitionPolicy } from '../../domain/services/payment-state-transition-policy';

const EVENTOS_PAYMENT_INTENT = new Set([
  'payment_intent.created',
  'payment_intent.processing',
  'payment_intent.requires_action',
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'payment_intent.canceled',
]);

const PROVEEDOR = 'stripe';

@Injectable()
export class WebhookProcessorService {
  private readonly logger = new Logger(
    WebhookProcessorService.name,
  );

  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly webhookEventRepository: WebhookEventRepository,
    private readonly stripeClientService: StripeClientService,
    private readonly statusMapper: StripeStatusMapper,
    private readonly paymentMethodMapper: StripePaymentMethodMapper,
    private readonly transitionPolicy: PaymentStateTransitionPolicy,
  ) {}

  async process(event: Stripe.Event): Promise<void> {
    const claim = await this.webhookEventRepository.claim({
      proveedor: PROVEEDOR,
      eventoId: event.id,
      tipo: event.type,
      payload: event as unknown,
    });

    if (!claim.claimed) {
      // Ya se procesó (o se está procesando) este evento -- no se repiten
      // los efectos, pero Stripe igual espera un 2xx.
      return;
    }

    try {
      await this.handleEvent(event);
    } finally {
      await this.webhookEventRepository.markProcessed(
        claim.id,
      );
    }
  }

  private async handleEvent(
    event: Stripe.Event,
  ): Promise<void> {
    if (!EVENTOS_PAYMENT_INTENT.has(event.type)) {
      return;
    }

    const paymentIntent = event.data
      .object as Stripe.PaymentIntent;

    const pago =
      await this.paymentRepository.findByStripePaymentIntentId(
        paymentIntent.id,
      );

    if (!pago) {
      this.logger.warn(
        `Webhook ${event.type} para un PaymentIntent (${paymentIntent.id}) sin Pago asociado -- ignorado.`,
      );

      return;
    }

    const nuevoEstado = this.statusMapper.map(paymentIntent);

    if (
      !this.transitionPolicy.isValidTransition(
        pago.estado,
        nuevoEstado,
      )
    ) {
      this.logger.warn(
        `Transición inválida ${pago.estado} -> ${nuevoEstado} para Pago ${pago.id} (evento ${event.id}) -- descartada.`,
      );

      return;
    }

    const metodoPago =
      nuevoEstado === EstadoPago.EXITOSO
        ? await this.extractMetodoPago(paymentIntent)
        : undefined;

    const aplicado =
      await this.paymentRepository.updateEstadoSiEsMasReciente(
        {
          id: pago.id,
          pedidoId: pago.pedidoId,
          estado: nuevoEstado,
          eventoCreatedAt: new Date(event.created * 1000),
          stripeChargeId:
            this.extractChargeId(paymentIntent),
          mensajeError:
            paymentIntent.last_payment_error?.message,
          metodoPago,
          marcarPedidoComoPagado:
            nuevoEstado === EstadoPago.EXITOSO,
        },
      );

    if (!aplicado) {
      this.logger.warn(
        `Evento ${event.id} descartado por ser más viejo que el último ya aplicado a Pago ${pago.id}.`,
      );
    }
  }

  private extractChargeId(
    paymentIntent: Stripe.PaymentIntent,
  ): string | undefined {
    if (typeof paymentIntent.latest_charge === 'string') {
      return paymentIntent.latest_charge;
    }

    return paymentIntent.latest_charge?.id;
  }

  private async extractMetodoPago(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<MetodoPago | undefined> {
    const paymentMethodId =
      typeof paymentIntent.payment_method === 'string'
        ? paymentIntent.payment_method
        : paymentIntent.payment_method?.id;

    if (!paymentMethodId) {
      return undefined;
    }

    try {
      const paymentMethod =
        await this.stripeClientService.retrievePaymentMethod(
          paymentMethodId,
        );

      return this.paymentMethodMapper.fromStripeType(
        paymentMethod.type,
        paymentMethod.card?.wallet?.type,
      );
    } catch (error) {
      this.logger.warn(
        `No se pudo obtener el método de pago ${paymentMethodId}: ${error}`,
      );

      return undefined;
    }
  }
}
