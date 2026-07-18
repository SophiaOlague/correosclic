import { ForbiddenException } from '@nestjs/common';

export class ProductNotOwnedException extends ForbiddenException {

  constructor() {
    super('El producto no pertenece al vendedor.');
  }

}