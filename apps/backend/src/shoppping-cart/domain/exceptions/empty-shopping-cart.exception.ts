import { BadRequestException } from '@nestjs/common';

export class EmptyShoppingCartException extends BadRequestException {
  constructor() {
    super('El carrito de compras está vacío.');
  }
}