import { NotFoundException } from '@nestjs/common';

export class SellerNotFoundException extends NotFoundException {
  constructor() {
    super(
      'El usuario aún no es un vendedor aprobado.',
    );
  }
}