import { NotFoundException } from '@nestjs/common';

export class StoreNotFoundException extends NotFoundException {
  constructor() {
    super('No se encontró una tienda asociada al vendedor.');
  }
}