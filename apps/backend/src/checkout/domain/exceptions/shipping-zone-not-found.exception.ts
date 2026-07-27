import { BadRequestException } from '@nestjs/common';

export class ShippingZoneNotFoundException extends BadRequestException {
  constructor(distanciaKm: number) {
    super(
      `No existe una zona tarifaria configurada para ${distanciaKm.toFixed(2)} km.`,
    );
  }
}
