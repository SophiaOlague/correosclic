import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';
import { BranchCandidate } from '../../domain/services/nearest-branch-resolver';

@Injectable()
export class BranchRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Candidatas para NearestBranchResolver: solo sucursales activas con coordenadas. */
  async findActiveWithCoordinates(): Promise<BranchCandidate[]> {
    const sucursales = await this.prisma.sucursal.findMany({
      where: { activa: true },
      select: {
        id: true,
        direccion: { select: { latitud: true, longitud: true } },
      },
    });

    return sucursales.map((sucursal) => ({
      id: sucursal.id,
      coordenadas: {
        latitud: Number(sucursal.direccion.latitud),
        longitud: Number(sucursal.direccion.longitud),
      },
    }));
  }

  async findById(id: string) {
    return this.prisma.sucursal.findUnique({ where: { id } });
  }

  /** Candidatos de vehículo para la transferencia troncal desde esta sucursal (decisión (k)). */
  async findVehiclesAtBranch(
    sucursalId: string,
  ): Promise<{ id: string; capacidadKg: number }[]> {
    const vehiculos = await this.prisma.vehiculo.findMany({
      where: { sucursalId, activo: true },
      select: { id: true, capacidadKg: true },
    });

    return vehiculos.map((vehiculo) => ({
      id: vehiculo.id,
      capacidadKg: Number(vehiculo.capacidadKg),
    }));
  }

  async findEmpleadoByUsuarioId(usuarioId: string) {
    return this.prisma.empleado.findUnique({
      where: { usuarioId },
      select: { id: true, sucursalId: true, activo: true },
    });
  }

  /** Igual que el anterior pero con los datos de la sucursal, para `GET /logistics/branches/me`. */
  async findEmpleadoWithBranchByUsuarioId(usuarioId: string) {
    return this.prisma.empleado.findUnique({
      where: { usuarioId },
      select: {
        id: true,
        puesto: true,
        activo: true,
        sucursal: { select: { id: true, codigo: true, nombre: true } },
      },
    });
  }
}
