/**
 * Contratos de Logistics. Espejo de
 * `apps/backend/src/logistics/application/dto/`.
 *
 * El motor logístico del backend decide ruta, vehículo y repartidor por su
 * cuenta a partir de hechos físicos certificados por personas. El frontend
 * **solo certifica hechos y muestra estados**: nunca elige ruta, ni sucursal,
 * ni repartidor, ni deduce en qué etapa va un envío.
 */

/** Valores de `EstadoEnvio` en Prisma. Los once, sin inventar intermedios. */
export const SHIPMENT_STATES = [
  'PENDIENTE_RECEPCION',
  'RECIBIDO_SUCURSAL',
  'CLASIFICADO',
  'EN_TRANSITO',
  'EN_SUCURSAL_DESTINO',
  'EN_REPARTO',
  'ENTREGADO',
  'DEVUELTO',
  'CANCELADO',
  'EXTRAVIADO',
  'DANADO',
] as const;

export type ShipmentState = (typeof SHIPMENT_STATES)[number];

/**
 * Estados de los que un envío ya no sale
 * (`ESTADOS_ENVIO_TERMINALES` en `shipment-state-transition-policy.ts`).
 */
const TERMINAL_STATES: readonly string[] = [
  'ENTREGADO',
  'DEVUELTO',
  'CANCELADO',
  'EXTRAVIADO',
  'DANADO',
];

export function isTerminalShipmentState(estado: string): boolean {
  return TERMINAL_STATES.includes(estado);
}

/** Valores de `ResultadoIntentoEntrega` en Prisma. */
export const DELIVERY_ATTEMPT_RESULTS = [
  'EXITOSO',
  'DESTINATARIO_AUSENTE',
  'DIRECCION_INCORRECTA',
  'RECHAZADO',
] as const;

export type DeliveryAttemptResult = (typeof DELIVERY_ATTEMPT_RESULTS)[number];

/** `ResultadoRecepcion` — lo que el recepcionista certifica al escanear. */
export const RECEPTION_RESULTS = ['ACEPTADO', 'DANADO', 'RECHAZADO'] as const;

export type ReceptionResult = (typeof RECEPTION_RESULTS)[number];

/**
 * Espejo de `ShipmentSummaryDto`.
 *
 * El mismo DTO sirve a dos endpoints que rellenan campos distintos: la lista
 * del cliente trae `vendedorId` y las fechas de entrega; la del vendedor trae
 * `createdAt`. Por eso todo salvo los tres primeros es opcional.
 */
export interface ShipmentSummaryDto {
  id: string;
  trackingInterno: string;
  estado: string;
  vendedorId?: string;
  /** ISO 8601; el backend serializa un `Date`. */
  fechaEntregaEstimada?: string | null;
  fechaEntregaReal?: string | null;
  createdAt?: string;
}

/** Espejo de `TrackingEventDto`. Llega ordenado `createdAt asc` desde Prisma. */
export interface TrackingEventDto {
  estado: string;
  descripcion: string;
  createdAt: string;
}

/** Espejo de `DeliveryAttemptDto`. */
export interface DeliveryAttemptDto {
  id: string;
  numeroIntento: number;
  resultado: string;
  observaciones: string | null;
  fotoIntentoUrl: string | null;
  createdAt: string;
}

/** Espejo de `ShipmentDeliveryDto`. */
export interface ShipmentDeliveryDto {
  id: string;
  repartidorId: string;
  fechaAsignacion: string;
  fechaEntrega: string | null;
  nombreRecibe: string | null;
  intentos: DeliveryAttemptDto[];
}

/** Espejo de `ShipmentTransferDto`. */
export interface ShipmentTransferDto {
  id: string;
  sucursalOrigenId: string;
  sucursalDestinoId: string;
  vehiculoId: string;
  fechaSalida: string;
  fechaLlegada: string | null;
}

export interface ShipmentBranchDto {
  id: string;
  nombre: string;
}

/** Espejo de `ShipmentResponseDto`. */
export interface ShipmentDetailDto {
  id: string;
  trackingInterno: string;
  estado: string;
  vendedorId: string;
  sucursalOrigen: ShipmentBranchDto;
  sucursalDestino: ShipmentBranchDto;
  distanciaKm: number | null;
  pesoRealKg: number | null;
  fechaEntregaEstimada: string | null;
  fechaEntregaReal: string | null;
  entrega: ShipmentDeliveryDto | null;
  transferencias: ShipmentTransferDto[];
  historial: TrackingEventDto[];
}

/** Espejo de `EmployeeBranchDto` — `GET /logistics/branches/me`. */
export interface EmployeeBranchDto {
  empleadoId: string;
  puesto: string;
  sucursalId: string;
  codigo: string;
  nombre: string;
}

/**
 * Elemento de las colas de sucursal.
 *
 * `reception-queue` y `dispatch-queue` devuelven el registro `Envio` de Prisma
 * tal cual, sin DTO: por eso los decimales llegan serializados como cadena y no
 * hay datos del pedido, del cliente ni del vendedor. Solo se declaran los
 * campos que la interfaz usa.
 */
export interface BranchQueueItemDto {
  id: string;
  pedidoVendedorId: string;
  trackingInterno: string;
  estado: string;
  sucursalOrigenId: string;
  sucursalDestinoId: string;
  pesoRealKg: string | number | null;
  fechaEntregaEstimada: string | null;
  createdAt: string;
}

/** Elemento de `GET /logistics/couriers/me/deliveries`. */
export interface CourierDeliveryDto {
  entregaId: string;
  envioId: string;
  trackingInterno: string;
  estado: string;
  fechaAsignacion: string;
}

/** Cuerpo de `POST /logistics/reception`. */
export interface ConfirmReceptionRequest {
  trackingInterno: string;
  /** Omitido equivale a `ACEPTADO`. */
  resultado?: ReceptionResult;
  /** Obligatorio cuando el resultado no es `ACEPTADO`. */
  observaciones?: string;
  pesoRealKg?: number;
}

/** Cuerpo de `POST /logistics/deliveries/:entregaId/attempts`. */
export interface RecordDeliveryAttemptRequest {
  resultado: DeliveryAttemptResult;
  observaciones?: string;
  fotoIntentoUrl?: string;
  nombreRecibe?: string;
}
