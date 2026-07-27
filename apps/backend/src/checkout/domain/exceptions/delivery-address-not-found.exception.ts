import { BadRequestException } from '@nestjs/common';

export class DeliveryAddressNotFoundException extends BadRequestException {
  constructor() {
    super(
      'El cliente no tiene una dirección de entrega principal registrada.',
    );
  }
}
