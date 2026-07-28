import { Injectable } from '@nestjs/common';

/**
 * Decide si, tras un intento de entrega fallido, corresponde reintentar o
 * devolver el envío al remitente. El máximo de intentos es un parámetro
 * (resuelto por la capa de aplicación desde ConfiguracionSistema, decisión
 * (g) del diseño) -- esta policy no conoce configuración, solo compara.
 */
@Injectable()
export class DeliveryRetryPolicy {
  debeDevolverAlRemitente(
    numeroIntento: number,
    maximoIntentos: number,
  ): boolean {
    return numeroIntento >= maximoIntentos;
  }
}
