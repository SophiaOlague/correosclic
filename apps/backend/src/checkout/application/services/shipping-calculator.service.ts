import { Inject, Injectable } from '@nestjs/common';

import { CheckoutRepository } from '../../infrastructure/repositories/checkout.repository';
import { SystemConfigRepository } from '../../../system-config/infrastructure/repositories/system-config.repository';
import { ConfiguracionSistemaKey } from '../../../system-config/domain/configuracion-sistema-key';

import { HaversineDistanceCalculator } from '../../domain/services/haversine-distance.calculator';
import type { GeoCoordinates } from '../../domain/services/haversine-distance.calculator';

import { SHIPPING_AGGREGATION_STRATEGY } from '../../domain/services/shipping-aggregation-strategy.interface';
import type { ShippingAggregationStrategy } from '../../domain/services/shipping-aggregation-strategy.interface';

import { ShippingZoneNotFoundException } from '../../domain/exceptions/shipping-zone-not-found.exception';
import { ShippingRateNotFoundException } from '../../domain/exceptions/shipping-rate-not-found.exception';

import {
  roundDistance,
  roundWeight,
} from '../../domain/utils/rounding.util';

import {
  ShippingCalculationItem,
  ShippingCalculationResult,
  VendorShippingQuote,
} from '../interfaces/shipping-calculation.interface';

interface VendorShipment {
  vendedorId: string;
  nombreTienda: string;
  estadoOperacion: GeoCoordinates;
  pesoTotalKg: number;
}

const PERCENTAGE_DIVISOR = 100;

@Injectable()
export class ShippingCalculatorService {
  constructor(
    private readonly checkoutRepository: CheckoutRepository,
    private readonly systemConfigRepository: SystemConfigRepository,
    private readonly distanceCalculator: HaversineDistanceCalculator,

    @Inject(SHIPPING_AGGREGATION_STRATEGY)
    private readonly aggregationStrategy: ShippingAggregationStrategy,
  ) {}

  async calculate(
    items: ShippingCalculationItem[],
    destination: GeoCoordinates,
  ): Promise<ShippingCalculationResult> {
    const vendorShipments = this.groupByVendor(items);

    const cotizaciones = await Promise.all(
      vendorShipments.map((shipment) =>
        this.quoteVendor(shipment, destination),
      ),
    );

    const additionalVendorFactor =
      await this.getAdditionalVendorFactor();

    const { total, contribuciones } =
      this.aggregationStrategy.aggregate(
        cotizaciones.map((cotizacion) => ({
          vendedorId: cotizacion.vendedorId,
          tarifa: cotizacion.tarifa,
        })),
        additionalVendorFactor,
      );

    const contribucionesPorVendedor = new Map(
      contribuciones.map((contribucion) => [
        contribucion.vendedorId,
        contribucion,
      ]),
    );

    const cotizacionesPorVendedor: VendorShippingQuote[] =
      cotizaciones.map((cotizacion) => {
        const contribucion = contribucionesPorVendedor.get(
          cotizacion.vendedorId,
        );

        return {
          ...cotizacion,
          esTarifaBase: contribucion?.esTarifaBase ?? false,
          recargoAplicado: contribucion?.esTarifaBase
            ? undefined
            : contribucion?.montoAplicado,
        };
      });

    return {
      costoEnvio: total,
      cotizacionesPorVendedor,
    };
  }

  private async quoteVendor(
    shipment: VendorShipment,
    destination: GeoCoordinates,
  ): Promise<
    Omit<VendorShippingQuote, 'esTarifaBase' | 'recargoAplicado'>
  > {
    const distanciaKm = this.distanceCalculator.calculateKm(
      shipment.estadoOperacion,
      destination,
    );

    const zona =
      await this.checkoutRepository.findZonaByDistancia(
        distanciaKm,
      );

    if (!zona) {
      throw new ShippingZoneNotFoundException(distanciaKm);
    }

    const tarifa =
      await this.checkoutRepository.findTarifaByZonaYPeso(
        zona.id,
        shipment.pesoTotalKg,
      );

    if (!tarifa) {
      throw new ShippingRateNotFoundException(
        zona.codigo,
        shipment.pesoTotalKg,
      );
    }

    return {
      vendedorId: shipment.vendedorId,
      nombreTienda: shipment.nombreTienda,
      pesoKg: roundWeight(shipment.pesoTotalKg),
      distanciaKm: roundDistance(distanciaKm),
      zonaTarifariaCodigo: zona.codigo,
      tarifa: Number(tarifa.precioConIva),
    };
  }

  private groupByVendor(
    items: ShippingCalculationItem[],
  ): VendorShipment[] {
    const shipmentsByVendor = new Map<string, VendorShipment>();

    for (const item of items) {
      const pesoItem = item.pesoKg * item.cantidad;

      const existing = shipmentsByVendor.get(item.vendedorId);

      if (existing) {
        existing.pesoTotalKg += pesoItem;
      } else {
        shipmentsByVendor.set(item.vendedorId, {
          vendedorId: item.vendedorId,
          nombreTienda: item.nombreTienda,
          estadoOperacion: item.estadoOperacion,
          pesoTotalKg: pesoItem,
        });
      }
    }

    return Array.from(shipmentsByVendor.values());
  }

  private async getAdditionalVendorFactor(): Promise<number> {
    const porcentaje =
      await this.systemConfigRepository.getNumber(
        ConfiguracionSistemaKey.ADDITIONAL_VENDOR_SHIPPING_FACTOR,
      );

    return porcentaje / PERCENTAGE_DIVISOR;
  }
}
