import { ConflictException } from '@nestjs/common';

export class InsufficientStockException
  extends ConflictException {

  constructor() {
    super(
      'No hay suficiente stock disponible.',
    );
  }

}