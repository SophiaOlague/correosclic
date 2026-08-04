import { NotFoundException } from '@nestjs/common';

/**
 * La solicitud existe pero no pertenece a quien la pide.
 *
 * Responde 404 y no 403, igual que Orders y Logistics: distinguir ambos casos
 * confirmaría al atacante que ese identificador existe.
 */
export class SellerRequestNotOwnedException extends NotFoundException {
  constructor() {
    super('La solicitud de vendedor no existe.');
  }
}
