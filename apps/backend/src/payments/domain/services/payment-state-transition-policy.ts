import { Injectable } from '@nestjs/common';
import { EstadoPago } from '@correosclic/database';

/** Único lugar donde se define qué es un Pago "activo" -- reusado por el repositorio para la búsqueda del pago activo de un pedido. */
export const ESTADOS_PAGO_ACTIVOS: EstadoPago[] = [
  EstadoPago.PENDIENTE,
  EstadoPago.REQUIERE_ACCION,
  EstadoPago.PROCESANDO,
];

/**
 * Grafo de transiciones legales de EstadoPago. Protege contra webhooks
 * fuera de orden o duplicados que intenten regresar un pago a un estado
 * anterior (ej. un "processing" tardío llegando después de "succeeded").
 * Se autopermite quedarse en el mismo estado (no-op idempotente).
 */
const TRANSICIONES_VALIDAS: Record<EstadoPago, EstadoPago[]> = {
  [EstadoPago.PENDIENTE]: [
    EstadoPago.PENDIENTE,
    EstadoPago.REQUIERE_ACCION,
    EstadoPago.PROCESANDO,
    EstadoPago.EXITOSO,
    EstadoPago.FALLIDO,
    EstadoPago.CANCELADO,
  ],
  [EstadoPago.REQUIERE_ACCION]: [
    EstadoPago.REQUIERE_ACCION,
    EstadoPago.PROCESANDO,
    EstadoPago.EXITOSO,
    EstadoPago.FALLIDO,
    EstadoPago.CANCELADO,
  ],
  [EstadoPago.PROCESANDO]: [
    EstadoPago.PROCESANDO,
    EstadoPago.EXITOSO,
    EstadoPago.FALLIDO,
    EstadoPago.CANCELADO,
  ],
  [EstadoPago.EXITOSO]: [
    EstadoPago.EXITOSO,
    EstadoPago.REEMBOLSADO,
  ],
  [EstadoPago.FALLIDO]: [EstadoPago.FALLIDO],
  [EstadoPago.CANCELADO]: [EstadoPago.CANCELADO],
  [EstadoPago.REEMBOLSADO]: [EstadoPago.REEMBOLSADO],
};

@Injectable()
export class PaymentStateTransitionPolicy {
  isValidTransition(
    actual: EstadoPago,
    siguiente: EstadoPago,
  ): boolean {
    return (
      TRANSICIONES_VALIDAS[actual]?.includes(siguiente) ??
      false
    );
  }

  esEstadoActivo(estado: EstadoPago): boolean {
    return ESTADOS_PAGO_ACTIVOS.includes(estado);
  }
}
