import { Injectable } from '@nestjs/common';
import { EstadoEnvio } from '@correosclic/database';

/** Estados finales de un Envio: ninguna operación posterior puede mutarlos. */
export const ESTADOS_ENVIO_TERMINALES: EstadoEnvio[] = [
  EstadoEnvio.ENTREGADO,
  EstadoEnvio.DEVUELTO,
  EstadoEnvio.CANCELADO,
  EstadoEnvio.EXTRAVIADO,
  EstadoEnvio.DANADO,
];

/**
 * Grafo de transiciones legales de EstadoEnvio. Protege contra mutaciones
 * fuera de orden o repetidas (ej. confirmar dos veces la misma recepción, o
 * reactivar un envío que ya está en un estado terminal). Se autopermite
 * quedarse en el mismo estado (no-op idempotente), igual que
 * PaymentStateTransitionPolicy en Payments.
 */
const TRANSICIONES_VALIDAS: Record<EstadoEnvio, EstadoEnvio[]> = {
  [EstadoEnvio.PENDIENTE_RECEPCION]: [
    EstadoEnvio.PENDIENTE_RECEPCION,
    EstadoEnvio.RECIBIDO_SUCURSAL,
    EstadoEnvio.CANCELADO,
  ],
  [EstadoEnvio.RECIBIDO_SUCURSAL]: [
    EstadoEnvio.RECIBIDO_SUCURSAL,
    EstadoEnvio.CLASIFICADO,
    EstadoEnvio.CANCELADO,
    EstadoEnvio.EXTRAVIADO,
    EstadoEnvio.DANADO,
  ],
  [EstadoEnvio.CLASIFICADO]: [
    EstadoEnvio.CLASIFICADO,
    EstadoEnvio.EN_TRANSITO,
    EstadoEnvio.EN_SUCURSAL_DESTINO,
    EstadoEnvio.CANCELADO,
    EstadoEnvio.EXTRAVIADO,
    EstadoEnvio.DANADO,
  ],
  [EstadoEnvio.EN_TRANSITO]: [
    EstadoEnvio.EN_TRANSITO,
    EstadoEnvio.EN_SUCURSAL_DESTINO,
    EstadoEnvio.DEVUELTO,
    EstadoEnvio.EXTRAVIADO,
    EstadoEnvio.DANADO,
    EstadoEnvio.CANCELADO,
  ],
  [EstadoEnvio.EN_SUCURSAL_DESTINO]: [
    EstadoEnvio.EN_SUCURSAL_DESTINO,
    EstadoEnvio.EN_REPARTO,
    EstadoEnvio.DEVUELTO,
    EstadoEnvio.EXTRAVIADO,
    EstadoEnvio.DANADO,
    EstadoEnvio.CANCELADO,
  ],
  [EstadoEnvio.EN_REPARTO]: [
    EstadoEnvio.EN_REPARTO,
    EstadoEnvio.ENTREGADO,
    EstadoEnvio.DEVUELTO,
    EstadoEnvio.EXTRAVIADO,
    EstadoEnvio.DANADO,
    EstadoEnvio.CANCELADO,
  ],
  [EstadoEnvio.ENTREGADO]: [EstadoEnvio.ENTREGADO],
  [EstadoEnvio.DEVUELTO]: [EstadoEnvio.DEVUELTO],
  [EstadoEnvio.CANCELADO]: [EstadoEnvio.CANCELADO],
  [EstadoEnvio.EXTRAVIADO]: [EstadoEnvio.EXTRAVIADO],
  [EstadoEnvio.DANADO]: [EstadoEnvio.DANADO],
};

@Injectable()
export class ShipmentStateTransitionPolicy {
  isValidTransition(actual: EstadoEnvio, siguiente: EstadoEnvio): boolean {
    return TRANSICIONES_VALIDAS[actual]?.includes(siguiente) ?? false;
  }

  esEstadoTerminal(estado: EstadoEnvio): boolean {
    return ESTADOS_ENVIO_TERMINALES.includes(estado);
  }
}
