import { ConflictException } from '@nestjs/common';

export class InventoryAlreadyExistsException
  extends ConflictException {

  constructor() {
    super(
      'La variante ya tiene un inventario registrado.',
    );
  }

}