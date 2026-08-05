import { Injectable } from '@nestjs/common';

export interface RouteResolution {
  requiereTransferencia: boolean;
}

/**
 * Decide si un Envio, dado su sucursalOrigenId/sucursalDestinoId ya fijos,
 * requiere una transferencia física entre sucursales. En v1 el salto es
 * siempre directo (sin hubs intermedios): si origen y destino coinciden, no
 * hay transferencia y el envío puede avanzar directo a la cola de reparto.
 */
@Injectable()
export class RouteResolver {
  resolve(
    sucursalOrigenId: string,
    sucursalDestinoId: string,
  ): RouteResolution {
    return {
      requiereTransferencia: sucursalOrigenId !== sucursalDestinoId,
    };
  }
}
