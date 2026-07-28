import { Injectable } from '@nestjs/common';

import {
  roundCurrency,
  roundWeight,
} from '../../domain/utils/rounding.util';

@Injectable()
export class CheckoutTotalService {
  calculateSubtotal(
    items: {
      precio: number;
      cantidad: number;
    }[],
  ): number {
    const subtotal = items.reduce(
      (total, item) => total + item.precio * item.cantidad,
      0,
    );

    return roundCurrency(subtotal);
  }

  calculateWeight(
    items: {
      pesoKg: number;
      cantidad: number;
    }[],
  ): number {
    const weight = items.reduce(
      (total, item) => total + item.pesoKg * item.cantidad,
      0,
    );

    return roundWeight(weight);
  }

  calculateItems(
    items: {
      cantidad: number;
    }[],
  ): number {
    return items.reduce(
      (total, item) => total + item.cantidad,
      0,
    );
  }

  /**
   * Extrae el monto de IVA ya incluido en un monto final (los precios del
   * catálogo y las tarifas de envío ya son con IVA incluido, no se suma aparte).
   */
  extractTax(
    amountWithTax: number,
    taxPercentage: number,
  ): number {
    const tax =
      (amountWithTax * taxPercentage) /
      (100 + taxPercentage);

    return roundCurrency(tax);
  }

  /**
   * Comisión de CorreosClic sobre el subtotal, informativa: se descuenta de
   * lo que se liquida a los vendedores, no se le suma al total que paga el cliente.
   */
  calculateCommission(
    subtotal: number,
    commissionPercentage: number,
  ): number {
    return roundCurrency(
      (subtotal * commissionPercentage) / 100,
    );
  }
}
