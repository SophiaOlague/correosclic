import { ForbiddenException } from '@nestjs/common';

export class CartItemAccessDeniedException extends ForbiddenException {
  constructor() {
    super(
      'No tienes permiso para modificar este elemento del carrito.',
    );
  }
}