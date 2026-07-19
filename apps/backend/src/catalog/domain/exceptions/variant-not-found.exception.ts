import { NotFoundException } from '@nestjs/common';

export class VariantNotFoundException
  extends NotFoundException {

  constructor() {
    super(
      'La variante no existe.',
    );
  }

}