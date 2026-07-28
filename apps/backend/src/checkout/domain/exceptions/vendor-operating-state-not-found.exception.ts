import { BadRequestException } from '@nestjs/common';

export class VendorOperatingStateNotFoundException extends BadRequestException {
  constructor(vendedorId: string) {
    super(
      `El vendedor ${vendedorId} no tiene un estado de operación configurado para calcular el envío.`,
    );
  }
}
