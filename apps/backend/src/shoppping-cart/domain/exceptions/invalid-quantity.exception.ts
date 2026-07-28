import { BadRequestException } from '@nestjs/common';

export class InvalidQuantityException extends BadRequestException {
  constructor() {
    super('La cantidad debe ser mayor a cero.');
  }
}