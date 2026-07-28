import { Injectable } from '@nestjs/common';

import { OrderPreparationService } from './order-preparation.service';
import {
  OrderRepository,
  OrderListRecord,
  OrderDetailRecord,
} from '../../infrastructure/repositories/order.repository';

import { UserRepository } from '../../../auth/infrastructure/repositories/user.repository';

import { OrderSummaryDto } from '../dto/order-summary.dto';
import {
  OrderListItemDto,
  OrderListResponseDto,
} from '../dto/order-list-item.dto';
import {
  OrderDetailDto,
  OrderVendorGroupDto,
} from '../dto/order-detail.dto';

import { CustomerNotFoundException } from '../../domain/exceptions/customer-not-found.exception';
import { OrderNotFoundException } from '../../domain/exceptions/order-not-found.exception';

@Injectable()
export class OrdersService {
  constructor(
    private readonly preparationService: OrderPreparationService,
    private readonly orderRepository: OrderRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async create(
    userId: string,
    direccionId?: string,
  ): Promise<OrderSummaryDto> {
    const prepared = await this.preparationService.prepare(
      userId,
      direccionId,
    );

    const pedido = await this.orderRepository.createOrder(
      prepared,
    );

    return {
      orderId: pedido.id,
      orderNumber: pedido.codigoPedido,
      status: pedido.estado,
      total: Number(pedido.total),
      paymentRequired: true,
    };
  }

  async list(
    userId: string,
    page: number,
    limit: number,
  ): Promise<OrderListResponseDto> {
    const client = await this.getClientByUserId(userId);

    const skip = (page - 1) * limit;

    const [pedidos, total] = await Promise.all([
      this.orderRepository.findManyByClientId(
        client.id,
        skip,
        limit,
      ),
      this.orderRepository.countByClientId(client.id),
    ]);

    return {
      orders: pedidos.map((pedido) =>
        this.toListItemDto(pedido),
      ),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getById(
    userId: string,
    orderId: string,
  ): Promise<OrderDetailDto> {
    const client = await this.getClientByUserId(userId);

    const pedido =
      await this.orderRepository.findByIdAndClientId(
        orderId,
        client.id,
      );

    if (!pedido) {
      throw new OrderNotFoundException();
    }

    return this.toDetailDto(pedido);
  }

  private toListItemDto(
    pedido: OrderListRecord,
  ): OrderListItemDto {
    return {
      orderId: pedido.id,
      orderNumber: pedido.codigoPedido,
      fecha: pedido.createdAt,
      estado: pedido.estado,
      total: Number(pedido.total),
      cantidadArticulos: pedido.items.reduce(
        (total, item) => total + item.cantidad,
        0,
      ),
      numeroVendedores: pedido._count.pedidoVendedores,
      miniaturaUrl: pedido.items[0]?.imagenUrl ?? null,
    };
  }

  private toDetailDto(
    pedido: OrderDetailRecord,
  ): OrderDetailDto {
    const itemsPorVendedor = new Map<
      string,
      OrderDetailRecord['items']
    >();

    for (const item of pedido.items) {
      const items =
        itemsPorVendedor.get(item.vendedorId) ?? [];

      items.push(item);
      itemsPorVendedor.set(item.vendedorId, items);
    }

    const vendedores: OrderVendorGroupDto[] =
      pedido.pedidoVendedores.map((pedidoVendedor) => {
        const items =
          itemsPorVendedor.get(
            pedidoVendedor.vendedorId,
          ) ?? [];

        return {
          vendedorId: pedidoVendedor.vendedorId,
          nombreTienda: items[0]?.nombreTienda ?? '',
          estado: pedidoVendedor.estado,
          subtotal: Number(pedidoVendedor.subtotal),
          costoEnvioAsignado: Number(
            pedidoVendedor.costoEnvioAsignado,
          ),
          comisionMarketplace: Number(
            pedidoVendedor.comisionMarketplace,
          ),
          totalPedido: Number(
            pedidoVendedor.totalPedido,
          ),
          items: items.map((item) => ({
            productoVarianteId: item.productoVarianteId,
            nombreProducto: item.nombreProducto,
            sku: item.sku,
            imagenUrl: item.imagenUrl,
            cantidad: item.cantidad,
            precioUnitario: Number(item.precioUnitario),
            subtotal: Number(item.subtotal),
            pesoKg: Number(item.pesoKg),
          })),
        };
      });

    return {
      orderId: pedido.id,
      orderNumber: pedido.codigoPedido,
      estado: pedido.estado,
      fecha: pedido.createdAt,
      fechaPago: pedido.fechaPago,
      direccionEntrega: {
        alias: pedido.direccionEntrega.alias,
        calle: pedido.direccionEntrega.calle,
        numeroExterior:
          pedido.direccionEntrega.numeroExterior,
        numeroInterior:
          pedido.direccionEntrega.numeroInterior,
        colonia: pedido.direccionEntrega.colonia,
        ciudad: pedido.direccionEntrega.ciudad.nombre,
        estadoProvincia:
          pedido.direccionEntrega.estadoProvincia.nombre,
        codigoPostal:
          pedido.direccionEntrega.codigoPostal.codigo,
        direccionFormateada:
          pedido.direccionEntrega.direccionFormateada,
      },
      resumenFinanciero: {
        subtotal: Number(pedido.subtotal),
        costoEnvio: Number(pedido.costoEnvio),
        comisionCorreosClic: Number(
          pedido.comisionCorreosClic,
        ),
        totalVendedores: Number(pedido.totalVendedores),
        total: Number(pedido.total),
      },
      vendedores,
    };
  }

  private async getClientByUserId(userId: string) {
    const client =
      await this.userRepository.findClientByUserId(
        userId,
      );

    if (!client) {
      throw new CustomerNotFoundException();
    }

    return client;
  }
}
