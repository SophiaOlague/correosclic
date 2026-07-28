import { Injectable } from '@nestjs/common';

import { CheckoutService } from '../../../checkout/application/services/checkout.service';
import { CheckoutSummaryDto } from '../../../checkout/application/dto/checkout-summary.dto';
import { roundCurrency } from '../../../checkout/domain/utils/rounding.util';

import { UserRepository } from '../../../auth/infrastructure/repositories/user.repository';

import { OrderCodeGenerator } from '../../domain/services/order-code-generator';
import { OrderStockConflictException } from '../../domain/exceptions/order-stock-conflict.exception';
import { CustomerNotFoundException } from '../../domain/exceptions/customer-not-found.exception';

import {
  PreparedOrder,
  PreparedOrderItem,
  PreparedOrderVendor,
} from '../interfaces/prepared-order.interface';

/**
 * Arma en memoria todo lo necesario para crear un pedido, reutilizando
 * CheckoutService como única fuente de verdad para subtotal/envío/IVA/
 * comisión — Orders no vuelve a calcular ninguna de esas reglas de negocio.
 */
@Injectable()
export class OrderPreparationService {
  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly userRepository: UserRepository,
    private readonly orderCodeGenerator: OrderCodeGenerator,
  ) {}

  async prepare(
    userId: string,
    direccionId?: string,
  ): Promise<PreparedOrder> {
    const client = await this.getClientByUserId(userId);

    const checkout = await this.checkoutService.getCheckout(
      userId,
      direccionId,
    );

    if (!checkout.canCheckout) {
      throw new OrderStockConflictException(
        checkout.warnings,
      );
    }

    const items: PreparedOrderItem[] = checkout.items.map(
      (item) => ({
        productoVarianteId: item.productoVarianteId,
        vendedorId: item.vendedorId,
        nombreTienda: item.nombreTienda,
        nombreProducto: item.nombre,
        sku: item.sku,
        imagenUrl: item.imagen,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.subtotal,
        pesoKg: item.pesoKg,
      }),
    );

    const vendedores = this.buildVendorBreakdown(checkout);

    return {
      clienteId: client.id,
      direccionEntregaId: checkout.direccionId,
      codigoPedido: this.orderCodeGenerator.generate(),
      subtotal: checkout.subtotal,
      costoEnvio: checkout.shipping,
      comisionCorreosClic: checkout.comisionMarketplace,
      totalVendedores: roundCurrency(
        checkout.subtotal - checkout.comisionMarketplace,
      ),
      total: checkout.total,
      items,
      vendedores,
    };
  }

  /**
   * Agrupa por vendedor reutilizando exclusivamente números que Checkout ya
   * calculó (nada de subtotal/envío/comisión se vuelve a derivar aquí):
   * - subtotal: suma de checkout.items por vendedorId.
   * - costoEnvioAsignado: el monto ya aplicado en checkout.envioDetalle
   *   (tarifa si es la base, o el recargo del 20% si es adicional).
   * - comisionMarketplace: reparto proporcional de checkout.comisionMarketplace
   *   según la participación de cada vendedor en el subtotal, para que la
   *   suma de todos cuadre exacto con el total ya calculado por Checkout.
   */
  private buildVendorBreakdown(
    checkout: CheckoutSummaryDto,
  ): PreparedOrderVendor[] {
    const subtotalPorVendedor = new Map<string, number>();

    for (const item of checkout.items) {
      const acumulado =
        subtotalPorVendedor.get(item.vendedorId) ?? 0;

      subtotalPorVendedor.set(
        item.vendedorId,
        acumulado + item.subtotal,
      );
    }

    const envioPorVendedor = new Map(
      checkout.envioDetalle.map((cotizacion) => [
        cotizacion.vendedorId,
        cotizacion.esTarifaBase
          ? cotizacion.tarifa
          : (cotizacion.recargoAplicado ?? 0),
      ]),
    );

    return Array.from(
      subtotalPorVendedor.entries(),
    ).map(([vendedorId, subtotalVendedor]) => {
      const costoEnvioAsignado =
        envioPorVendedor.get(vendedorId) ?? 0;

      const comisionMarketplace = roundCurrency(
        checkout.subtotal > 0
          ? (subtotalVendedor / checkout.subtotal) *
              checkout.comisionMarketplace
          : 0,
      );

      return {
        vendedorId,
        subtotal: subtotalVendedor,
        costoEnvioAsignado,
        comisionMarketplace,
        totalPedido: roundCurrency(
          subtotalVendedor + costoEnvioAsignado,
        ),
      };
    });
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
