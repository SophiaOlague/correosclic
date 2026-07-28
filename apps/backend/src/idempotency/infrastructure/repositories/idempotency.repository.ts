import { Injectable } from '@nestjs/common';
import {
  EstadoIdempotencia,
  IdempotencyKey,
  Prisma,
} from '@correosclic/database';

import { PrismaService } from '../../../prisma/prisma.service';

const UNIQUE_CONSTRAINT_ERROR_CODE = 'P2002';

export type IdempotencyClaimResult =
  | { claimed: true; id: string }
  | { claimed: false; existing: IdempotencyKey };

@Injectable()
export class IdempotencyRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Intenta "reservar" la clave con un INSERT atómico. Si ya existe
   * (violación de la unique constraint), no hay condición de carrera posible:
   * Postgres serializa el conflicto y devolvemos el registro existente para
   * que el interceptor decida si reproducir la respuesta o rechazar.
   */
  async claim(
    usuarioId: string,
    clave: string,
    ruta: string,
    huellaSolicitud: string,
  ): Promise<IdempotencyClaimResult> {
    try {
      const created = await this.prisma.idempotencyKey.create({
        data: {
          usuarioId,
          clave,
          ruta,
          huellaSolicitud,
        },
      });

      return {
        claimed: true,
        id: created.id,
      };
    } catch (error) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_CONSTRAINT_ERROR_CODE
      ) {
        const existing =
          await this.prisma.idempotencyKey.findUniqueOrThrow({
            where: {
              usuarioId_clave_ruta: {
                usuarioId,
                clave,
                ruta,
              },
            },
          });

        return {
          claimed: false,
          existing,
        };
      }

      throw error;
    }
  }

  async complete(
    id: string,
    statusCode: number,
    respuesta: unknown,
  ): Promise<void> {
    await this.prisma.idempotencyKey.update({
      where: {
        id,
      },
      data: {
        estado: EstadoIdempotencia.COMPLETADA,
        statusCode,
        respuesta: respuesta as Prisma.InputJsonValue,
        completadoEn: new Date(),
      },
    });
  }

  /** Libera la clave si la operación falló, para permitir reintentar con la misma. */
  async release(id: string): Promise<void> {
    await this.prisma.idempotencyKey
      .delete({
        where: {
          id,
        },
      })
      .catch(() => undefined);
  }
}
