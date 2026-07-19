import { ConflictException } from '@nestjs/common';

export class AttributeAlreadyExistsException
  extends ConflictException {

  constructor() {
    super(
      'Ya existe un atributo con ese nombre.',
    );
  }

}