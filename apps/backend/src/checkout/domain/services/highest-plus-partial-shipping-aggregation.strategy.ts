import { Injectable } from '@nestjs/common';

import { ShippingAggregationStrategy } from './shipping-aggregation-strategy.interface';

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
    vendorRates: number[],
    additionalVendorFactor: number,
  ): number {
    if (vendorRates.length === 0) {
      return 0;
    }

    const [base, ...additionalRates] = [...vendorRates].sort(
      (a, b) => b - a,
    );

    const additionalCost = additionalRates.reduce(
      (total, rate) => total + rate * additionalVendorFactor,
      0,
    );

    return base + additionalCost;
  }
}
