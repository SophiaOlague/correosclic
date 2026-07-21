import { NotFoundException } from '@nestjs/common';

export class ShoppingCartItemNotFoundException extends NotFoundException {
  constructor() {
    super('No se encontró el producto en el carrito.');
  }
}