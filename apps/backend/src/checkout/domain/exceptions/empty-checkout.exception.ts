import { BadRequestException } from '@nestjs/common';

export class EmptyCheckoutException extends BadRequestException {
  constructor() {
    super('El carrito está vacío.');
  }
}