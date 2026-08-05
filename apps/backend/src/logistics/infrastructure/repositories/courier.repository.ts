import { Injectable } from '@nestjs/common';
import { EstadoEnvio } from '@correosclic/database';

import { PrismaService } from '../../../prisma/prisma.service';
import { CourierCandidate } from '../../domain/services/delivery-assignment-policy';

@Injectable()
export class CourierRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Repartidores activos de una sucursal con su vehículo vigente
   * (AsignacionVehiculo sin fechaFin, o con fechaFin en el futuro).
   * Candidatos para DeliveryAssignmentPolicy.
   */
  async findAvailableCandidates(
    sucursalId: string,
  ): Promise<CourierCandidate[]> {
    const repartidores = await this.prisma.repartidor.findMany({
      where: {
        activo: true,
        empleado: { sucursalId, activo: true },
        asignacionesVehiculo: {
          some: {
            OR: [{ fechaFin: null }, { fechaFin: { gt: new Date() } }],
          },
        },
      },
      select: {
        id: true,
        asignacionesVehiculo: {
          where: {
            OR: [{ fechaFin: null }, { fechaFin: { gt: new Date() } }],
          },
          orderBy: { fechaInicio: 'desc' },
          take: 1,
          select: {
            vehiculo: { select: { id: true, capacidadKg: true } },
          },
        },
      },
    });

    return repartidores
      .filter((repartidor) => repartidor.asignacionesVehiculo[0]?.vehiculo)
      .map((repartidor) => ({
        repartidorId: repartidor.id,
        vehiculoId: repartidor.asignacionesVehiculo[0].vehiculo.id,
        capacidadVehiculoKg: Number(
          repartidor.asignacionesVehiculo[0].vehiculo.capacidadKg,
        ),
      }));
  }

  async findByUsuarioId(usuarioId: string) {
    return this.prisma.repartidor.findFirst({
      where: { empleado: { usuarioId } },
      select: { id: true, activo: true },
    });
  }

  /**
   * Entregas que el repartidor todavía tiene abiertas.
   *
   * El criterio es el estado del envío, no `fechaEntrega: null`. Esa fecha solo
   * se escribe cuando el paquete se entrega, así que cualquier desenlace que no
   * sea una entrega -- devolución al agotarse los intentos, cancelación,
   * extravío -- la dejaba en null para siempre y la entrega seguía apareciendo
   * como activa. `EstadoEnvio` es lo que el dominio mantiene de verdad, vía
   * ShipmentStateTransitionPolicy, y EN_REPARTO es exactamente la fase en la
   * que el repartidor puede actuar: fuera de ella, recordDeliveryAttempt
   * rechaza el intento con InvalidShipmentTransitionException.
   */
  async findActiveEntregasByRepartidorId(repartidorId: string) {
    return this.prisma.entrega.findMany({
      where: { repartidorId, envio: { estado: EstadoEnvio.EN_REPARTO } },
      include: { envio: { select: { id: true, trackingInterno: true, estado: true } } },
      orderBy: { fechaAsignacion: 'asc' },
    });
  }
}
