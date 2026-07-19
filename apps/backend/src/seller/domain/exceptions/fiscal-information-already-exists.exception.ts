import { ConflictException } from '@nestjs/common';

export class FiscalInformationAlreadyExistsException extends ConflictException {
  constructor() {
    super('La información fiscal ya fue registrada.');
  }
}