import { ConflictException } from '@nestjs/common';

export class OrderStockConflictException extends ConflictException {
  constructor(warnings: string[]) {
    super({
      message:
        'No se pudo crear el pedido: hay productos sin stock suficiente.',
      warnings,
    });
  }
}
