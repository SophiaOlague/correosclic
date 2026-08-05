/**
 * Contratos de Checkout. Espejo de
 * `apps/backend/src/checkout/application/dto/`.
 *
 * **Todos los importes los calcula el backend.** El frontend no suma, no
 * prorratea y no deriva ninguna cifra financiera: solo formatea y presenta.
 */

/** Espejo de `CheckoutAddressDto`. Es lo único que el backend expone de una dirección. */
export interface CheckoutAddressDto {
  id: string;
  alias: string | null;
  /** Cadena ya compuesta por el backend; no vienen los campos por separado. */
  direccionFormateada: string | null;
  esPrincipal: boolean;
}

/** Espejo de `CheckoutItemDto`. */
export interface CheckoutItemDto {
  productoId: string;
  productoVarianteId: string;
  vendedorId: string;
  nombreTienda: string;
  nombre: string;
  sku: string;
  imagen: string | null;
  /** Valores de los atributos de la variante, p. ej. ["Negro", "M"]. */
  atributos: string[];
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  pesoKg: number;
}

/**
 * Espejo de `VendorShippingQuoteDto`.
 *
 * Regla multivendedor (`HighestPlusPartialShippingAggregationStrategy`): la
 * tarifa más alta se cobra completa —el vendedor con `esTarifaBase: true`— y
 * cada vendedor adicional aporta solo una fracción de la suya, que llega en
 * `recargoAplicado`. Por eso **la suma de `tarifa` NO es el envío total**: lo
 * que se cobra es la tarifa base más los recargos.
 */
export interface VendorShippingQuoteDto {
  vendedorId: string;
  nombreTienda: string;
  pesoKg: number;
  distanciaKm: number;
  zonaTarifariaCodigo: string;
  /** Tarifa completa que le correspondería a este vendedor por separado. */
  tarifa: number;
  esTarifaBase: boolean;
  /** Importe realmente aplicado cuando no es la tarifa base. */
  recargoAplicado?: number;
}

/** Espejo de `CheckoutSummaryDto`. */
export interface CheckoutSummaryDto {
  items: CheckoutItemDto[];
  /** Dirección efectivamente usada para cotizar; puede no ser la solicitada. */
  direccionId: string;
  itemsCount: number;
  subtotal: number;
  totalWeightKg: number;
  shipping: number;
  total: number;
  /** Informativo: IVA ya contenido en `total`, no se suma aparte. */
  ivaIncluido: number;
  /** Informativo: comisión de CorreosClic a los vendedores. NO la paga el cliente. */
  comisionMarketplace: number;
  canCheckout: boolean;
  /** Motivos por los que no se puede continuar, redactados por el backend. */
  warnings: string[];
  envioDetalle: VendorShippingQuoteDto[];
}

/** Agrupación por vendedor, derivada de `items` + `envioDetalle` para presentar. */
export interface VendorGroup {
  vendedorId: string;
  nombreTienda: string;
  items: CheckoutItemDto[];
  envio: VendorShippingQuoteDto | undefined;
}
