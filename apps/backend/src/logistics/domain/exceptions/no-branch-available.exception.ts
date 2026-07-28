import { ConflictException } from '@nestjs/common';

export class NoBranchAvailableException extends ConflictException {
  constructor() {
    super('No hay sucursales activas disponibles para generar el envío.');
  }
}
