import { NotFoundException } from '@nestjs/common';

export class StoreNotFoundException extends NotFoundException {
  constructor() {
    super('El vendedor aún no tiene una tienda registrada.');
  }
}
