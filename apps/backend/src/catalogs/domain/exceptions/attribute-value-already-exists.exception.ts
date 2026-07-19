import { ConflictException } from '@nestjs/common';

export class AttributeValueAlreadyExistsException
  extends ConflictException {

  constructor() {
    super(
      'Ya existe ese valor para el atributo.',
    );
  }

}