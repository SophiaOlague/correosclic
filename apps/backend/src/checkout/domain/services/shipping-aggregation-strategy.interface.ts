export const SHIPPING_AGGREGATION_STRATEGY = Symbol(
  'SHIPPING_AGGREGATION_STRATEGY',
);

export interface ShippingVendorRate {
  vendedorId: string;
  tarifa: number;
}

export interface ShippingVendorContribution {
  vendedorId: string;
  tarifa: number;

  /** Monto que esta tarifa realmente aporta al costo de envío total. */
  montoAplicado: number;

  /** true si esta fue la tarifa más alta (se cobra completa). */
  esTarifaBase: boolean;
}

export interface ShippingAggregationResult {
  total: number;
  contribuciones: ShippingVendorContribution[];
}

export interface ShippingAggregationStrategy {
  /**
   * @param vendorRates tarifa individual calculada por cada vendedor (sin combinar).
   * @param additionalVendorFactor factor (0-1) aplicado a la tarifa de cada vendedor
   *   que no sea el de mayor tarifa.
   */
  aggregate(
    vendorRates: ShippingVendorRate[],
    additionalVendorFactor: number,
  ): ShippingAggregationResult;
}
