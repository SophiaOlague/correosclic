import { ConflictException } from '@nestjs/common';

export class DocumentAlreadyExistsException extends ConflictException {
  constructor(tipo: string) {
    super(`Ya existe un documento registrado de tipo ${tipo}.`);
  }
}