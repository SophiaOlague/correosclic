import { ConflictException } from '@nestjs/common';

export class CategorySlugAlreadyExistsException extends ConflictException {
  constructor() {
    super('Ya existe una categoría con ese slug.');
  }
}