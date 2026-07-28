import { NotFoundException } from '@nestjs/common';

export class ShipmentNotFoundException extends NotFoundException {
  constructor() {
    super('Envío no encontrado.');
  }
}
