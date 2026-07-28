import { Injectable } from '@nestjs/common';
import { Prisma } from '@correosclic/database';

import { PrismaService } from '../../../prisma/prisma.service';

const UNIQUE_CONSTRAINT_ERROR_CODE = 'P2002';

export interface ClaimWebhookEventParams {
  proveedor: string;
  eventoId: string;
  tipo: string;
  payload: unknown;
  firma?: string;
}

export type WebhookEventClaimResult =
  | { claimed: true; id: string }
  | { claimed: false };

/**
 * Deduplicación de webhooks (mismo patrón que IdempotencyRepository, pero
 * para eventos de un proveedor externo, no de un usuario autenticado):
 * INSERT atómico sobre (proveedor, eventoId), sin lectura-antes-de-escribir.
 */
@Injectable()
export class WebhookEventRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async claim(
    params: ClaimWebhookEventParams,
  ): Promise<WebhookEventClaimResult> {
    try {
      const created =
        await this.prisma.webhookEvento.create({
          data: {
            proveedor: params.proveedor,
            eventoId: params.eventoId,
            tipo: params.tipo,
            payload: params.payload as Prisma.InputJsonValue,
            firma: params.firma,
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
        return {
          claimed: false,
        };
      }

      throw error;
    }
  }

  async markProcessed(id: string): Promise<void> {
    await this.prisma.webhookEvento.update({
      where: {
        id,
      },
      data: {
        procesado: true,
        procesadoEn: new Date(),
      },
    });
  }
}
