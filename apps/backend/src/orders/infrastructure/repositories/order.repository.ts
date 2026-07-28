import { Injectable } from '@nestjs/common';
import {
  EstadoPedido,
  EstadoPedidoVendedor,
  Prisma,
} from '@correosclic/database';

import { PrismaService } from '../../../prisma/prisma.service';

import { OrderStockConflictException } from '../../domain/exceptions/order-stock-conflict.exception';

import {
  PreparedOrder,
  PreparedOrderItem,
} from '../../application/interfaces/prepared-order.interface';

@Injectable()
export class OrderRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createOrder(prepared: PreparedOrder) {
    return this.prisma.$transaction(async (tx) => {
      await this.reserveInventory(tx, prepared.items);

      const pedido = await tx.pedido.create({
        data: {
          clienteId: prepared.clienteId,
          direccionEntregaId: prepared.direccionEntregaId,
          codigoPedido: prepared.codigoPedido,
          estado: EstadoPedido.PENDIENTE_PAGO,
          subtotal: prepared.subtotal,
          costoEnvio: prepared.costoEnvio,
          comisionCorreosClic: prepared.comisionCorreosClic,
          totalVendedores: prepared.totalVendedores,
          total: prepared.total,

          items: {
            create: prepared.items.map((item) => ({
              productoVarianteId:
                item.productoVarianteId,
              vendedorId: item.vendedorId,
              nombreTienda: item.nombreTienda,
              nombreProducto: item.nombreProducto,
              sku: item.sku,
              imagenUrl: item.imagenUrl,
              cantidad: item.cantidad,
              precioUnitario: item.precioUnitario,
              subtotal: item.subtotal,
              pesoKg: item.pesoKg,
            })),
          },

          pedidoVendedores: {
            create: prepared.vendedores.map(
              (vendedor) => ({
                vendedorId: vendedor.vendedorId,
                estado: EstadoPedidoVendedor.PENDIENTE_PAGO,
                subtotal: vendedor.subtotal,
                costoEnvioAsignado:
                  vendedor.costoEnvioAsignado,
                comisionMarketplace:
                  vendedor.comisionMarketplace,
                totalPedido: vendedor.totalPedido,
              }),
            ),
          },
        },
      });

      await this.clearCart(tx, prepared.clienteId);

      return pedido;
    });
  }

  /**
   * Mueve unidades de stockDisponible -> stockReservado de forma atómica
   * (update condicionado, no lectura-luego-escritura) para evitar sobreventa
   * si dos pedidos compiten por el mismo stock al mismo tiempo.
   */
  private async reserveInventory(
    tx: Prisma.TransactionClient,
    items: PreparedOrderItem[],
  ): Promise<void> {
    for (const item of items) {
      const resultado = await tx.inventario.updateMany({
        where: {
          productoVarianteId: item.productoVarianteId,
          stockDisponible: {
            gte: item.cantidad,
          },
        },
        data: {
          stockDisponible: {
            decrement: item.cantidad,
          },
          stockReservado: {
            increment: item.cantidad,
          },
        },
      });

      if (resultado.count === 0) {
        throw new OrderStockConflictException([
          `El producto "${item.nombreProducto}" (SKU ${item.sku}) ya no tiene stock suficiente.`,
        ]);
      }
    }
  }

  private async clearCart(
    tx: Prisma.TransactionClient,
    clienteId: string,
  ): Promise<void> {
    const carrito = await tx.carrito.findUnique({
      where: {
        clienteId,
      },
    });

    if (!carrito) {
      return;
    }

    await tx.carritoItem.deleteMany({
      where: {
        carritoId: carrito.id,
      },
    });
  }

  async findManyByClientId(
    clienteId: string,
    skip: number,
    take: number,
  ) {
    return this.prisma.pedido.findMany({
      where: {
        clienteId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
      select: {
        id: true,
        codigoPedido: true,
        estado: true,
        total: true,
        createdAt: true,

        items: {
          orderBy: {
            createdAt: 'asc',
          },
          select: {
            cantidad: true,
            imagenUrl: true,
          },
        },

        _count: {
          select: {
            pedidoVendedores: true,
          },
        },
      },
    });
  }

  async countByClientId(clienteId: string): Promise<number> {
    return this.prisma.pedido.count({
      where: {
        clienteId,
      },
    });
  }

  async findByIdAndClientId(
    pedidoId: string,
    clienteId: string,
  ) {
    return this.prisma.pedido.findFirst({
      where: {
        id: pedidoId,
        clienteId,
      },
      select: {
        id: true,
        codigoPedido: true,
        estado: true,
        subtotal: true,
        costoEnvio: true,
        comisionCorreosClic: true,
        totalVendedores: true,
        total: true,
        createdAt: true,
        fechaPago: true,

        direccionEntrega: {
          select: {
            alias: true,
            calle: true,
            numeroExterior: true,
            numeroInterior: true,
            colonia: true,
            direccionFormateada: true,

            ciudad: {
              select: {
                nombre: true,
              },
            },

            estadoProvincia: {
              select: {
                nombre: true,
              },
            },

            codigoPostal: {
              select: {
                codigo: true,
              },
            },
          },
        },

        items: {
          orderBy: {
            createdAt: 'asc',
          },
          select: {
            productoVarianteId: true,
            vendedorId: true,
            nombreTienda: true,
            nombreProducto: true,
            sku: true,
            imagenUrl: true,
            cantidad: true,
            precioUnitario: true,
            subtotal: true,
            pesoKg: true,
          },
        },

        pedidoVendedores: {
          select: {
            vendedorId: true,
            estado: true,
            subtotal: true,
            costoEnvioAsignado: true,
            comisionMarketplace: true,
            totalPedido: true,
          },
        },
      },
    });
  }
}

export type OrderListRecord = Awaited<
  ReturnType<OrderRepository['findManyByClientId']>
>[number];

export type OrderDetailRecord = NonNullable<
  Awaited<ReturnType<OrderRepository['findByIdAndClientId']>>
>;
