import { ConflictException } from '@nestjs/common';

export class VariantSkuAlreadyExistsException
  extends ConflictException {

  constructor() {
    super(
      'Ya existe una variante con ese SKU.',
    );
  }

}