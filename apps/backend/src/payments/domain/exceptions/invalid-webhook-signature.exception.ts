import { BadRequestException } from '@nestjs/common';

export class InvalidWebhookSignatureException extends BadRequestException {
  constructor() {
    super('Firma de webhook inválida.');
  }
}
