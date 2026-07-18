import { BadRequestException } from '@nestjs/common';

export class ProductImageLimitException extends BadRequestException {
  constructor() {
    super('Un producto no puede tener más de 10 imágenes.');
  }
}