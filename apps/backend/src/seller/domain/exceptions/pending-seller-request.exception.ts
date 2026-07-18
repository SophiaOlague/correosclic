import { ConflictException } from '@nestjs/common';

export class PendingSellerRequestException extends ConflictException {
  constructor() {
    super('Ya existe una solicitud de vendedor pendiente.');
  }
}