import { NotFoundException } from '@nestjs/common';

export class ShoppingCartNotFoundException extends NotFoundException {
  constructor() {
    super('No se encontró el carrito de compras.');
  }
}