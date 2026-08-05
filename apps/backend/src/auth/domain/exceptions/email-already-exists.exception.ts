import { ConflictException } from '@nestjs/common';

export class EmailAlreadyExistsException extends ConflictException {
  constructor() {
    super('El correo electrónico ya está registrado.');
  }
}
