import { ConflictException } from '@nestjs/common';

export class InvalidShipmentTransitionException extends ConflictException {
  constructor() {
    super(
      'El envío no puede pasar de su estado actual al estado solicitado.',
    );
  }
}
