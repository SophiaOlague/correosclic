export const SHIPPING_AGGREGATION_STRATEGY = Symbol(
  'SHIPPING_AGGREGATION_STRATEGY',
);

export interface ShippingAggregationStrategy {
  /**
   * @param vendorRates tarifa individual calculada por cada vendedor (sin combinar).
   * @param additionalVendorFactor factor (0-1) aplicado a la tarifa de cada vendedor
   *   que no sea el de mayor tarifa.
   */
  aggregate(
    vendorRates: number[],
    additionalVendorFactor: number,
  ): number;
}
