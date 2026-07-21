import { Injectable } from '@nestjs/common';

import { ShoppingCartDto } from '../dto/shopping-cart.dto';
import { ShoppingCartItemDto } from '../dto/shopping-cart-item.dto';

import { CompleteShoppingCart, ShoppingCartAggregate } from '../../infrastructure/repositories/shopping-cart.repository';

@Injectable()
export class ShoppingCartMapper {
  toDto(cart: CompleteShoppingCart): ShoppingCartDto {
    if (!cart) {
      return {
        id: null,
        items: [],
        subtotal: 0,
        total: 0,
      };
    }

    const items = cart.items.map((item) =>
      this.toItemDto(item),
    );

    const subtotal = items.reduce(
      (total, item) => total + item.subtotal,
      0,
    );

    return {
      id: cart.id,
      items,
      subtotal,
      total: subtotal,
    };
  }

  private toItemDto(
    item: ShoppingCartAggregate['items'][number],
): ShoppingCartItemDto {
    const precioUnitario =
      item.productoVariante.precio.toNumber();

    const stockDisponible =
      item.productoVariante.inventario?.stockDisponible ??
      0;

    return {
      id: item.id,
      productoVarianteId: item.productoVariante.id,
      nombreProducto:
        item.productoVariante.producto.nombre,
      sku: item.productoVariante.sku,
      imagenPrincipalUrl: this.getMainImageUrl(
        item.productoVariante.producto.imagenes,
      ),
      precioUnitario,
      cantidad: item.cantidad,
      stockDisponible,
      disponible: this.isAvailable(
        item.cantidad,
        stockDisponible,
      ),
      subtotal: this.calculateSubtotal(
        precioUnitario,
        item.cantidad,
      ),
    };
  }

  private calculateSubtotal(
    precioUnitario: number,
    cantidad: number,
  ): number {
    return precioUnitario * cantidad;
  }

  private isAvailable(
    cantidad: number,
    stockDisponible: number,
  ): boolean {
    return stockDisponible >= cantidad;
  }

  private getMainImageUrl(
    imagenes: { url: string }[],
  ): string | null {
    return imagenes[0]?.url ?? null;
  }
}