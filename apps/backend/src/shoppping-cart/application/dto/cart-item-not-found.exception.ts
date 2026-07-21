import { NotFoundException } from '@nestjs/common';

export class CartItemNotFoundException extends NotFoundException {
  constructor() {
    super('El elemento del carrito no existe.');
  }
}