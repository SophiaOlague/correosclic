import { Injectable } from '@nestjs/common';
import {
  EstadoPago,
  EstadoPedido,
  EstadoPedidoVendedor,
  MetodoPago,
} from '@correosclic/database';

import { PrismaService } from '../../../prisma/prisma.service';
import { ESTADOS_PAGO_ACTIVOS } from '../../domain/services/payment-state-transition-policy';

export interface CreatePaymentParams {
  pedidoId: string;
  stripePaymentIntentId: string;
  stripeIdempotencyKey: string;
  monto: number;
  moneda: string;
}

export interface UpdatePaymentStateIfNewerParams {
  id: string;
  pedidoId: string;
  estado: EstadoPago;
  eventoCreatedAt: Date;
  stripeChargeId?: string;
  comisionStripe?: number;
  mensajeError?: string;
  metodoPago?: MetodoPago;
  /** true cuando estado === EXITOSO: marca Pedido -> PAGADO en la misma transacción. */
  marcarPedidoComoPagado: boolean;
}

@Injectable()
export class PaymentRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(params: CreatePaymentParams) {
    return this.prisma.pago.create({
      data: {
        pedidoId: params.pedidoId,
        stripePaymentIntentId:
          params.stripePaymentIntentId,
        stripeIdempotencyKey:
          params.stripeIdempotencyKey,
        estado: EstadoPago.PENDIENTE,
        monto: params.monto,
        moneda: params.moneda,
      },
    });
  }

  async findActiveByOrderId(pedidoId: string) {
    return this.prisma.pago.findFirst({
      where: {
        pedidoId,
        estado: {
          in: ESTADOS_PAGO_ACTIVOS,
        },
      },
    });
  }

  async findMostRecentByOrderId(pedidoId: string) {
    return this.prisma.pago.findFirst({
      where: {
        pedidoId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByStripePaymentIntentId(
    stripePaymentIntentId: string,
  ) {
    return this.prisma.pago.findUnique({
      where: {
        stripePaymentIntentId,
      },
    });
  }

  /**
   * Update atómico y condicionado (no lectura-luego-escritura): solo aplica
   * si no hay un evento más reciente ya registrado. Protege contra webhooks
   * de Stripe fuera de orden. Si marcarPedidoComoPagado es true, el Pedido y
   * todos sus PedidoVendedor pasan a PAGADO en la MISMA transacción -- nunca
   * queda el Pago en EXITOSO con el Pedido atorado en PENDIENTE_PAGO, ni el
   * Pedido pagado con sus vendedores sin pagar, por un crash a la mitad.
   * Devuelve false si el evento era más viejo (se descartó) o si el
   * registro ya no existe.
   */
  async updateEstadoSiEsMasReciente(
    params: UpdatePaymentStateIfNewerParams,
  ): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const resultado = await tx.pago.updateMany({
        where: {
          id: params.id,
          OR: [
            {
              ultimoEventoStripeEn: null,
            },
            {
              ultimoEventoStripeEn: {
                lt: params.eventoCreatedAt,
              },
            },
          ],
        },
        data: {
          estado: params.estado,
          ultimoEventoStripeEn: params.eventoCreatedAt,
          ...(params.stripeChargeId && {
            stripeChargeId: params.stripeChargeId,
          }),
          ...(params.comisionStripe !== undefined && {
            comisionStripe: params.comisionStripe,
          }),
          ...(params.mensajeError !== undefined && {
            mensajeError: params.mensajeError,
          }),
          ...(params.metodoPago && {
            metodoPago: params.metodoPago,
          }),
        },
      });

      if (resultado.count !== 1) {
        return false;
      }

      if (params.marcarPedidoComoPagado) {
        await tx.pedido.update({
          where: {
            id: params.pedidoId,
          },
          data: {
            estado: EstadoPedido.PAGADO,
            fechaPago: new Date(),
          },
        });

        // El pago deja consistente todo el agregado antes de que se emita
        // OrderReadyForFulfillmentEvent: si solo se moviera Pedido.estado, cada
        // PedidoVendedor seguiria en PENDIENTE_PAGO y el pedido se leeria como
        // pagado y sin pagar a la vez. Logistics consume el evento para iniciar
        // el fulfillment, no para corregir estados de pago.
        //
        // Se acota a los que siguen en PENDIENTE_PAGO para no revivir a un
        // vendedor ya cancelado.
        await tx.pedidoVendedor.updateMany({
          where: {
            pedidoId: params.pedidoId,
            estado: EstadoPedidoVendedor.PENDIENTE_PAGO,
          },
          data: {
            estado: EstadoPedidoVendedor.PAGADO,
          },
        });
      }

      return true;
    });
  }

  /** Solo los campos que Payments necesita del pedido -- no reemplaza a OrderRepository. */
  async findOrderForPayment(pedidoId: string) {
    return this.prisma.pedido.findUnique({
      where: {
        id: pedidoId,
      },
      select: {
        id: true,
        clienteId: true,
        estado: true,
        total: true,
      },
    });
  }

  async findClienteForPayment(usuarioId: string) {
    return this.prisma.cliente.findUnique({
      where: {
        usuarioId,
      },
      select: {
        id: true,
        stripeCustomerId: true,
        usuario: {
          select: {
            email: true,
            nombre: true,
            apellidoPaterno: true,
          },
        },
      },
    });
  }

  async setStripeCustomerId(
    clienteId: string,
    stripeCustomerId: string,
  ): Promise<void> {
    await this.prisma.cliente.update({
      where: {
        id: clienteId,
      },
      data: {
        stripeCustomerId,
      },
    });
  }
}
