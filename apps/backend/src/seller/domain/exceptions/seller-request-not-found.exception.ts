import { NotFoundException } from '@nestjs/common';

export class SellerRequestNotFoundException extends NotFoundException {
  constructor() {
    super('La solicitud de vendedor no existe.');
  }
}