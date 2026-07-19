import { NotFoundException } from '@nestjs/common';

export class AttributeValueNotFoundException
  extends NotFoundException {

  constructor() {
    super(
      'Uno o más valores de atributo no existen.',
    );
  }

}