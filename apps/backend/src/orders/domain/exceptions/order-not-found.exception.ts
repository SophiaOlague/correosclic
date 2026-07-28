import { NotFoundException } from '@nestjs/common';

export class OrderNotFoundException extends NotFoundException {
  constructor() {
    super('Pedido no encontrado.');
  }
}
