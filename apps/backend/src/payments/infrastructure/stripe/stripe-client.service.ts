import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

/**
 * Único punto del proyecto que importa el SDK oficial de Stripe. Todo lo
 * demás en Payments (y a futuro Payouts/Connect) pasa por aquí — si algo del
 * lado de Stripe cambia, el blast radius queda contenido en este archivo.
 */
export interface CreatePaymentIntentParams {
  /** En la unidad más pequeña de la moneda (centavos para MXN) -- la conversión desde Decimal la hace quien llama. */
  amount: number;
  currency: string;
  customerId?: string;
  metadata: Record<string, string>;
  idempotencyKey: string;
}

export interface CreateStripeCustomerParams {
  email: string;
  nombre: string;
  idempotencyKey: string;
}

@Injectable()
export class StripeClientService {
  private readonly stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.getOrThrow<string>(
        'STRIPE_SECRET_KEY',
      ),
    );
  }

  async createPaymentIntent(
    params: CreatePaymentIntentParams,
  ): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create(
      {
        amount: params.amount,
        currency: params.currency,
        customer: params.customerId,
        metadata: params.metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      },
      {
        idempotencyKey: params.idempotencyKey,
      },
    );
  }

  async retrievePaymentIntent(
    stripePaymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(
      stripePaymentIntentId,
    );
  }

  async createCustomer(
    params: CreateStripeCustomerParams,
  ): Promise<Stripe.Customer> {
    return this.stripe.customers.create(
      {
        email: params.email,
        name: params.nombre,
      },
      {
        idempotencyKey: params.idempotencyKey,
      },
    );
  }

  async retrievePaymentMethod(
    paymentMethodId: string,
  ): Promise<Stripe.PaymentMethod> {
    return this.stripe.paymentMethods.retrieve(
      paymentMethodId,
    );
  }
}
