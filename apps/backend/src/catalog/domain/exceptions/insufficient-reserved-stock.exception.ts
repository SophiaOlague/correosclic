import { ConflictException } from '@nestjs/common';

export class InsufficientReservedStockException
  extends ConflictException {

  constructor() {
    super(
      'No hay suficiente stock reservado.',
    );
  }

}