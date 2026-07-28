import { Injectable } from '@nestjs/common';
import { EstadoPedido } from '@correosclic/database';

import { PaymentRepository } from '../../infrastructure/repositories/payment.repository';
import { StripeClientService } from '../../infrastructure/stripe/stripe-client.service';

import { CustomerNotFoundException } from '../../domain/exceptions/customer-not-found.exception';
import { OrderNotPayableException } from '../../domain/exceptions/order-not-payable.exception';
import { PaymentNotFoundException } from '../../domain/exceptions/payment-not-found.exception';

import { PaymentIntentResponseDto } from '../dto/payment-intent-response.dto';
import { PaymentStatusDto } from '../dto/payment-status.dto';

const STRIPE_CURRENCY = 'mxn';
const CENTAVOS_POR_UNIDAD = 100;

@Injectable()
export class PaymentIntentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly stripeClientService: StripeClientService,
  ) {}

  async createOrReuse(
    userId: string,
    orderId: string,
    idempotencyKey: string,
  ): Promise<PaymentIntentResponseDto> {
    const cliente = await this.getClienteForPayment(
      userId,
    );

    const pedido = await this.getPedidoPayable(
      orderId,
      cliente.id,
    );

    const pagoActivo =
      await this.paymentRepository.findActiveByOrderId(
        orderId,
      );

    if (pagoActivo) {
      return this.buildResponseFromExisting(pagoActivo);
    }

    const stripeCustomerId =
      await this.ensureStripeCustomer(cliente);

    const montoCentavos = Math.round(
      Number(pedido.total) * CENTAVOS_POR_UNIDAD,
    );

    const paymentIntent =
      await this.stripeClientService.createPaymentIntent({
        amount: montoCentavos,
        currency: STRIPE_CURRENCY,
        customerId: stripeCustomerId,
        metadata: {
          pedidoId: pedido.id,
        },
        idempotencyKey,
      });

    const pago = await this.paymentRepository.create({
      pedidoId: pedido.id,
      stripePaymentIntentId: paymentIntent.id,
      stripeIdempotencyKey: idempotencyKey,
      monto: Number(pedido.total),
      moneda: STRIPE_CURRENCY.toUpperCase(),
    });

    return {
      paymentId: pago.id,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret!,
      status: pago.estado,
      amount: Number(pago.monto),
      currency: pago.moneda,
    };
  }

  async getStatus(
    userId: string,
    orderId: string,
  ): Promise<PaymentStatusDto> {
    const cliente = await this.getClienteForPayment(
      userId,
    );

    const pedido =
      await this.paymentRepository.findOrderForPayment(
        orderId,
      );

    if (!pedido || pedido.clienteId !== cliente.id) {
      throw new PaymentNotFoundException();
    }

    const pago =
      await this.paymentRepository.findMostRecentByOrderId(
        orderId,
      );

    if (!pago) {
      throw new PaymentNotFoundException();
    }

    return {
      paymentId: pago.id,
      paymentIntentId: pago.stripePaymentIntentId,
      status: pago.estado,
      amount: Number(pago.monto),
      currency: pago.moneda,
      metodoPago: pago.metodoPago,
      mensajeError: pago.mensajeError,
    };
  }

  private async buildResponseFromExisting(
    pago: NonNullable<
      Awaited<
        ReturnType<
          PaymentRepository['findActiveByOrderId']
        >
      >
    >,
  ): Promise<PaymentIntentResponseDto> {
    const paymentIntent =
      await this.stripeClientService.retrievePaymentIntent(
        pago.stripePaymentIntentId!,
      );

    return {
      paymentId: pago.id,
      paymentIntentId: pago.stripePaymentIntentId!,
      clientSecret: paymentIntent.client_secret!,
      status: pago.estado,
      amount: Number(pago.monto),
      currency: pago.moneda,
    };
  }

  /**
   * Crea el Customer de Stripe la primera vez que el cliente paga, y lo
   * reutiliza en todos los pagos siguientes. La idempotency key es
   * determinística por cliente (no la del header) para que un reintento
   * después de un crash a mitad del flujo no cree un Customer duplicado.
   */
  private async ensureStripeCustomer(
    cliente: NonNullable<
      Awaited<
        ReturnType<
          PaymentRepository['findClienteForPayment']
        >
      >
    >,
  ): Promise<string> {
    if (cliente.stripeCustomerId) {
      return cliente.stripeCustomerId;
    }

    const customer =
      await this.stripeClientService.createCustomer({
        email: cliente.usuario.email,
        nombre: `${cliente.usuario.nombre} ${cliente.usuario.apellidoPaterno}`,
        idempotencyKey: `customer:${cliente.id}`,
      });

    await this.paymentRepository.setStripeCustomerId(
      cliente.id,
      customer.id,
    );

    return customer.id;
  }

  private async getClienteForPayment(userId: string) {
    const cliente =
      await this.paymentRepository.findClienteForPayment(
        userId,
      );

    if (!cliente) {
      throw new CustomerNotFoundException();
    }

    return cliente;
  }

  private async getPedidoPayable(
    orderId: string,
    clienteId: string,
  ) {
    const pedido =
      await this.paymentRepository.findOrderForPayment(
        orderId,
      );

    if (
      !pedido ||
      pedido.clienteId !== clienteId ||
      pedido.estado !== EstadoPedido.PENDIENTE_PAGO
    ) {
      throw new OrderNotPayableException();
    }

    return pedido;
  }
}
