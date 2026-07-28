import { BadRequestException } from '@nestjs/common';

export class OrderNotPayableException extends BadRequestException {
  constructor() {
    super(
      'El pedido no existe, no pertenece al cliente, o ya no está pendiente de pago.',
    );
  }
}
