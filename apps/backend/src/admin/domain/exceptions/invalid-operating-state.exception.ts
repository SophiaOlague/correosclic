import { ConflictException } from '@nestjs/common';

/**
 * El estado de operación elegido no sirve para dar de alta al vendedor.
 *
 * Se comprueba al aprobar y no después porque un `Vendedor` con un estado sin
 * coordenadas es indistinguible de uno correcto hasta que su primer pedido se
 * paga y el envío no se genera.
 */
export class InvalidOperatingStateException extends ConflictException {
  constructor(motivo: string) {
    super(motivo);
  }
}
