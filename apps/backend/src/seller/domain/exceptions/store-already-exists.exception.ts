import { ConflictException } from '@nestjs/common';

export class StoreAlreadyExistsException extends ConflictException {
  constructor() {
    super(
      'El vendedor ya tiene una tienda registrada.',
    );
  }
}