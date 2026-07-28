import { CheckoutItemDto } from './checkout-item.dto';
import { VendorShippingQuoteDto } from './vendor-shipping-quote.dto';

export class CheckoutSummaryDto {
  items: CheckoutItemDto[];

  /** Dirección de entrega efectivamente usada para cotizar el envío. */
  direccionId: string;

  itemsCount: number;

  subtotal: number;

  totalWeightKg: number;

  shipping: number;

  total: number;

  /** Informativo: IVA ya incluido en subtotal + envío (los precios son con IVA incluido). */
  ivaIncluido: number;

  /** Informativo: comisión de CorreosClic sobre el subtotal (se liquida a vendedores, no se le suma al total del cliente). */
  comisionMarketplace: number;

  canCheckout: boolean;

  warnings: string[];

  envioDetalle: VendorShippingQuoteDto[];
}