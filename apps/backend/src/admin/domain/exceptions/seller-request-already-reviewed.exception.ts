import { ConflictException } from '@nestjs/common';

export class SellerRequestAlreadyReviewedException extends ConflictException {
  constructor() {
    super('La solicitud ya fue revisada.');
  }
}