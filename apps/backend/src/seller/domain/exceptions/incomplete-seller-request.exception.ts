import { ConflictException } from '@nestjs/common';

export class IncompleteSellerRequestException extends ConflictException {
  constructor() {
    super(
      'La solicitud aún no está completa para enviarse a revisión.',
    );
  }
}