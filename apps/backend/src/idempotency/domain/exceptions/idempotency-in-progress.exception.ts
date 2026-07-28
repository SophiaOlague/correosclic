import { ConflictException } from '@nestjs/common';

export class IdempotencyInProgressException extends ConflictException {
  constructor() {
    super(
      'Ya existe una solicitud en proceso con este Idempotency-Key. Intenta de nuevo en unos segundos.',
    );
  }
}
