import { Injectable } from '@nestjs/common';

@Injectable()
export class CheckoutTotalService {
  calculateSubtotal(
    items: {
      precio: number;
      cantidad: number;
    }[],
  ): number {
    return items.reduce(
      (total, item) => total + item.precio * item.cantidad,
      0,
    );
  }

  calculateWeight(
    items: {
      pesoKg: number;
      cantidad: number;
    }[],
  ): number {
    return items.reduce(
      (total, item) => total + item.pesoKg * item.cantidad,
      0,
    );
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
}