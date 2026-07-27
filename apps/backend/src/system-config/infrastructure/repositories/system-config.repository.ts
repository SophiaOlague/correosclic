import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';
import { ConfiguracionSistemaKey } from '../../domain/configuracion-sistema-key';

@Injectable()
export class SystemConfigRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getNumber(
    clave: ConfiguracionSistemaKey,
  ): Promise<number> {
    const configuracion =
      await this.prisma.configuracionSistema.findUniqueOrThrow({
        where: {
          clave,
        },
      });

    return Number(configuracion.valor);
  }
}
