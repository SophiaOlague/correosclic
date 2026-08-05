import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Lectura y escritura de `ConfiguracionSistema` desde el panel.
 *
 * El repositorio de `system-config` solo expone `getNumber`, pensado para que
 * los módulos de dominio consulten una clave concreta. Este es su contraparte
 * administrativa: lista las claves y actualiza su valor.
 */
@Injectable()
export class AdminSystemConfigRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByKeys(claves: string[]) {
    return this.prisma.configuracionSistema.findMany({
      where: { clave: { in: claves } },
      orderBy: { clave: 'asc' },
      select: {
        clave: true,
        valor: true,
        descripcion: true,
        updatedAt: true,
      },
    });
  }

  /** Devuelve null si la clave no existe: no se crean claves desde el panel. */
  async updateValue(clave: string, valor: string) {
    const existente = await this.prisma.configuracionSistema.findUnique({
      where: { clave },
      select: { id: true },
    });

    if (!existente) return null;

    return this.prisma.configuracionSistema.update({
      where: { clave },
      data: { valor },
      select: {
        clave: true,
        valor: true,
        descripcion: true,
        updatedAt: true,
      },
    });
  }
}
