import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Lecturas de la red operativa para el panel administrativo.
 *
 * `Sucursal`, `Vehiculo` y `Empleado` los siembra el seed y los consume
 * Logistics, pero ningún endpoint permitía verlos: `GET /logistics/branches/me`
 * devuelve solo la del empleado autenticado. Son lecturas; el alta y la baja de
 * la red siguen sin existir.
 */
@Injectable()
export class AdminOperationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findBranches() {
    return this.prisma.sucursal.findMany({
      orderBy: { nombre: 'asc' },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        telefono: true,
        email: true,
        activa: true,
        direccion: {
          select: {
            direccionFormateada: true,
            ciudad: { select: { nombre: true } },
            estadoProvincia: { select: { id: true, nombre: true } },
          },
        },
        _count: {
          select: { empleados: true, vehiculos: true },
        },
      },
    });
  }

  async findVehicles() {
    return this.prisma.vehiculo.findMany({
      orderBy: { placas: 'asc' },
      select: {
        id: true,
        placas: true,
        marca: true,
        modelo: true,
        anio: true,
        capacidadKg: true,
        activo: true,
        sucursal: { select: { id: true, nombre: true } },
        asignaciones: {
          where: {
            OR: [{ fechaFin: null }, { fechaFin: { gt: new Date() } }],
          },
          orderBy: { fechaInicio: 'desc' },
          take: 1,
          select: {
            fechaInicio: true,
            repartidor: {
              select: {
                id: true,
                empleado: {
                  select: {
                    usuario: {
                      select: { nombre: true, apellidoPaterno: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
