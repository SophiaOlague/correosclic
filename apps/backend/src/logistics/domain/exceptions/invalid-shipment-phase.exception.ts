import { ConflictException } from '@nestjs/common';

/**
 * Se lanza cuando se invoca la fase del motor de planificación equivocada
 * para el estado actual del envío (ej. intentar asignar repartidor antes de
 * que el envío haya llegado a la sucursal destino). Es una guarda defensiva
 * en tiempo de ejecución, adicional a que el propio LogisticsOrchestratorService
 * solo llama a cada fase desde el punto del flujo que le corresponde.
 */
export class InvalidShipmentPhaseException extends ConflictException {
  constructor() {
    super(
      'El envío no está en la fase operativa correspondiente para esta acción.',
    );
  }
}
