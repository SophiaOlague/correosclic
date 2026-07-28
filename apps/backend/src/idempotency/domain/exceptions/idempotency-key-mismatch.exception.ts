import { UnprocessableEntityException } from '@nestjs/common';

export class IdempotencyKeyMismatchException extends UnprocessableEntityException {
  constructor() {
    super(
      'El Idempotency-Key ya fue usado con una solicitud distinta. Genera una nueva clave para una operación nueva.',
    );
  }
}
