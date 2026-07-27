import { CheckoutItemDto } from './checkout-item.dto';
import { VendorShippingQuoteDto } from './vendor-shipping-quote.dto';

export class CheckoutSummaryDto {
  items: CheckoutItemDto[];

  itemsCount: number;

  subtotal: number;

  totalWeightKg: number;

  shipping: number;

  total: number;

  canCheckout: boolean;

  warnings: string[];

  envioDetalle: VendorShippingQuoteDto[];
}