import { BadRequestException } from '@nestjs/common';

export class IdempotencyKeyRequiredException extends BadRequestException {
  constructor() {
    super(
      'El header Idempotency-Key es requerido para esta operación.',
    );
  }
}
