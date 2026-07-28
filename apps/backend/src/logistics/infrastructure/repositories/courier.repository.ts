import { Injectable } from '@nestjs/common';

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

  async findActiveEntregasByRepartidorId(repartidorId: string) {
    return this.prisma.entrega.findMany({
      where: { repartidorId, fechaEntrega: null },
      include: { envio: { select: { id: true, trackingInterno: true, estado: true } } },
      orderBy: { fechaAsignacion: 'asc' },
    });
  }
}
