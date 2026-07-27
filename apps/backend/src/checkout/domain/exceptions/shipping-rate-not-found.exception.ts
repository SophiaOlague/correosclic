import { BadRequestException } from '@nestjs/common';

export class ShippingRateNotFoundException extends BadRequestException {
  constructor(zonaTarifariaCodigo: string, pesoKg: number) {
    super(
      `No existe una tarifa de envío vigente para la zona ${zonaTarifariaCodigo} con ${pesoKg.toFixed(3)} kg.`,
    );
  }
}
