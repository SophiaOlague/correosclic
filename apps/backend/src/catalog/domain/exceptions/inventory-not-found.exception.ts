import { NotFoundException } from '@nestjs/common';

export class InventoryNotFoundException
  extends NotFoundException {

  constructor() {
    super(
      'El inventario no existe.',
    );
  }

}