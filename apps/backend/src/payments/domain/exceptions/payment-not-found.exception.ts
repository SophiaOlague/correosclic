import { NotFoundException } from '@nestjs/common';

export class PaymentNotFoundException extends NotFoundException {
  constructor() {
    super('No hay ningún pago registrado para este pedido.');
  }
}
