import { EstadoEnvio } from '@correosclic/database';

import { ShipmentDetailRecord } from '../../infrastructure/repositories/shipment.repository';

export class TrackingEventDto {
  estado!: EstadoEnvio;
  descripcion!: string;
  createdAt!: Date;
}

export class ShipmentResponseDto {
  id!: string;
  trackingInterno!: string;
  estado!: EstadoEnvio;
  vendedorId!: string;
  sucursalOrigen!: { id: string; nombre: string };
  sucursalDestino!: { id: string; nombre: string };
  distanciaKm!: number | null;
  pesoRealKg!: number | null;
  fechaEntregaEstimada!: Date | null;
  fechaEntregaReal!: Date | null;
  entrega!: {
    repartidorId: string;
    fechaAsignacion: Date;
    fechaEntrega: Date | null;
    intentos: number;
  } | null;
  historial!: TrackingEventDto[];

  static fromRecord(record: ShipmentDetailRecord): ShipmentResponseDto {
    const dto = new ShipmentResponseDto();

    dto.id = record.id;
    dto.trackingInterno = record.trackingInterno;
    dto.estado = record.estado;
    dto.vendedorId = record.pedidoVendedor.vendedorId;
    dto.sucursalOrigen = record.sucursalOrigen;
    dto.sucursalDestino = record.sucursalDestino;
    dto.distanciaKm = record.distanciaKm ? Number(record.distanciaKm) : null;
    dto.pesoRealKg = record.pesoRealKg ? Number(record.pesoRealKg) : null;
    dto.fechaEntregaEstimada = record.fechaEntregaEstimada;
    dto.fechaEntregaReal = record.fechaEntregaReal;

    dto.entrega = record.entrega
      ? {
          repartidorId: record.entrega.repartidorId,
          fechaAsignacion: record.entrega.fechaAsignacion,
          fechaEntrega: record.entrega.fechaEntrega,
          intentos: record.entrega.intentos.length,
        }
      : null;

    dto.historial = record.eventosTracking.map((evento) => ({
      estado: evento.estado,
      descripcion: evento.descripcion,
      createdAt: evento.createdAt,
    }));

    return dto;
  }
}
