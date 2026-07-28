import { Injectable } from '@nestjs/common';

import {
  ShippingAggregationResult,
  ShippingAggregationStrategy,
  ShippingVendorContribution,
  ShippingVendorRate,
} from './shipping-aggregation-strategy.interface';
import { roundCurrency } from '../utils/rounding.util';

/**
 * Regla de negocio para pedidos multivendedor: la tarifa más alta se cobra
 * completa (tarifa base) y cada vendedor adicional aporta solo una fracción
 * (additionalVendorFactor) de su propia tarifa, en vez de sumarlas todas.
 *
 * Ejemplo con factor 0.20: [95, 80, 110] -> 110 + (95*0.20) + (80*0.20) = 145
 */
@Injectable()
export class HighestPlusPartialShippingAggregationStrategy
  implements ShippingAggregationStrategy
{
  aggregate(
    vendorRates: ShippingVendorRate[],
    additionalVendorFactor: number,
  ): ShippingAggregationResult {
    if (vendorRates.length === 0) {
      return {
        total: 0,
        contribuciones: [],
      };
    }

    const [base, ...additionalRates] = [
      ...vendorRates,
    ].sort((a, b) => b.tarifa - a.tarifa);

    const contribuciones: ShippingVendorContribution[] = [
      {
        vendedorId: base.vendedorId,
        tarifa: base.tarifa,
        montoAplicado: base.tarifa,
        esTarifaBase: true,
      },

      ...additionalRates.map(
        (rate): ShippingVendorContribution => ({
          vendedorId: rate.vendedorId,
          tarifa: rate.tarifa,
          montoAplicado: roundCurrency(
            rate.tarifa * additionalVendorFactor,
          ),
          esTarifaBase: false,
        }),
      ),
    ];

    const total = roundCurrency(
      contribuciones.reduce(
        (sum, contribucion) =>
          sum + contribucion.montoAplicado,
        0,
      ),
    );

    return {
      total,
      contribuciones,
    };
  }
}
