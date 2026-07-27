import { Injectable } from '@nestjs/common';

import {
  CheckoutRepository,
  CheckoutCartItem,
} from '../../infrastructure/repositories/checkout.repository';

import { UserRepository } from '../../../auth/infrastructure/repositories/user.repository';

import { CheckoutSummaryDto } from '../dto/checkout-summary.dto';
import { CheckoutItemDto } from '../dto/checkout-item.dto';

import { CheckoutTotalService } from './checkout-total.service';
import { ShippingCalculatorService } from './shipping-calculator.service';

import { GeoCoordinates } from '../../domain/services/haversine-distance.calculator';
import { ShippingCalculationItem } from '../interfaces/shipping-calculation.interface';

import { EmptyCheckoutException } from '../../domain/exceptions/empty-checkout.exception';
import { CustomerNotFoundException } from '../../domain/exceptions/customer-not-found.exception';
import { DeliveryAddressNotFoundException } from '../../domain/exceptions/delivery-address-not-found.exception';
import { VendorOperatingStateNotFoundException } from '../../domain/exceptions/vendor-operating-state-not-found.exception';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly repository: CheckoutRepository,
    private readonly totals: CheckoutTotalService,
    private readonly shippingCalculator: ShippingCalculatorService,
    private readonly userRepository: UserRepository,
  ) {}

  async getCheckout(
    userId: string,
  ): Promise<CheckoutSummaryDto> {
    const client = await this.getClientByUserId(userId);

    const cart =
      await this.repository.findCartForCheckout(client.id);

    if (!cart || cart.items.length === 0) {
      throw new EmptyCheckoutException();
    }

    const warnings = this.validateStock(cart.items);

    const items = cart.items.map((item) =>
      this.toItemDto(item),
    );

    const subtotal = this.totals.calculateSubtotal(
      cart.items.map((item) => ({
        precio: Number(item.productoVariante.precio),
        cantidad: item.cantidad,
      })),
    );

    const totalWeightKg = this.totals.calculateWeight(
      cart.items.map((item) => ({
        pesoKg: Number(
          item.productoVariante.pesoKg ?? 0,
        ),
        cantidad: item.cantidad,
      })),
    );

    const itemsCount = this.totals.calculateItems(
      cart.items.map((item) => ({
        cantidad: item.cantidad,
      })),
    );

    const destination =
      await this.getDeliveryDestination(client.id);

    const shippingItems = this.buildShippingItems(
      cart.items,
    );

    const shippingResult =
      await this.shippingCalculator.calculate(
        shippingItems,
        destination,
      );

    const total = subtotal + shippingResult.costoEnvio;

    return {
      items,
      itemsCount,
      subtotal,
      totalWeightKg,
      shipping: shippingResult.costoEnvio,
      total,
      canCheckout: warnings.length === 0,
      warnings,
      envioDetalle: shippingResult.cotizacionesPorVendedor,
    };
  }

  private toItemDto(
    item: CheckoutCartItem,
  ): CheckoutItemDto {
    const precioUnitario = Number(
      item.productoVariante.precio,
    );

    const pesoUnitarioKg = Number(
      item.productoVariante.pesoKg ?? 0,
    );

    return {
      productoId: item.productoVariante.producto.id,

      productoVarianteId: item.productoVariante.id,

      nombre: item.productoVariante.producto.nombre,

      sku: item.productoVariante.sku,

      imagen:
        item.productoVariante.producto.imagenes[0]?.url ??
        null,

      atributos: item.productoVariante.valores.map(
        (valor) => valor.valorAtributo.valor,
      ),

      cantidad: item.cantidad,

      precioUnitario,

      subtotal: precioUnitario * item.cantidad,

      pesoKg: pesoUnitarioKg * item.cantidad,
    };
  }

  private validateStock(
    items: CheckoutCartItem[],
  ): string[] {
    const warnings: string[] = [];

    for (const item of items) {
      const stockDisponible =
        item.productoVariante.inventario
          ?.stockDisponible ?? 0;

      if (item.cantidad > stockDisponible) {
        warnings.push(
          `El producto "${item.productoVariante.producto.nombre}" (SKU ${item.productoVariante.sku}) ya no tiene stock suficiente: disponible ${stockDisponible}, solicitado ${item.cantidad}.`,
        );
      }
    }

    return warnings;
  }

  private buildShippingItems(
    items: CheckoutCartItem[],
  ): ShippingCalculationItem[] {
    return items.map((item) => {
      const vendedorId =
        item.productoVariante.producto.tienda.vendedorId;

      const estadoOperacion =
        item.productoVariante.producto.tienda.vendedor
          .estadoOperacion;

      if (
        !estadoOperacion ||
        estadoOperacion.latitud === null ||
        estadoOperacion.longitud === null
      ) {
        throw new VendorOperatingStateNotFoundException(
          vendedorId,
        );
      }

      return {
        vendedorId,
        estadoOperacion: {
          latitud: Number(estadoOperacion.latitud),
          longitud: Number(estadoOperacion.longitud),
        },
        pesoKg: Number(
          item.productoVariante.pesoKg ?? 0,
        ),
        cantidad: item.cantidad,
      };
    });
  }

  private async getDeliveryDestination(
    clienteId: string,
  ): Promise<GeoCoordinates> {
    const direccionCliente =
      await this.repository.findPrincipalDeliveryAddress(
        clienteId,
      );

    if (
      !direccionCliente ||
      direccionCliente.direccion.codigoPostal.latitud ===
        null ||
      direccionCliente.direccion.codigoPostal.longitud ===
        null
    ) {
      throw new DeliveryAddressNotFoundException();
    }

    return {
      latitud: Number(
        direccionCliente.direccion.codigoPostal.latitud,
      ),
      longitud: Number(
        direccionCliente.direccion.codigoPostal.longitud,
      ),
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
