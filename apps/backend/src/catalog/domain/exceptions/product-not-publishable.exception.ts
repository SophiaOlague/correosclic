import { ConflictException } from '@nestjs/common';

import { MotivoNoPublicable } from '../services/product-publication.policy';

const MENSAJE_POR_MOTIVO: Record<MotivoNoPublicable, string> = {
  [MotivoNoPublicable.SIN_VARIANTES]:
    'El producto no puede publicarse porque no tiene ninguna variante activa. Agrega al menos una antes de publicarlo.',
  [MotivoNoPublicable.SIN_INVENTARIO]:
    'El producto no puede publicarse porque ninguna de sus variantes tiene inventario registrado.',
  [MotivoNoPublicable.SIN_STOCK]:
    'El producto no puede publicarse porque ninguna de sus variantes tiene stock disponible.',
};

/**
 * Publicar es hacer el producto comprable. Si no cumple lo que el carrito
 * exige, publicarlo solo produciría una ficha que el cliente no puede comprar.
 */
export class ProductNotPublishableException extends ConflictException {
  constructor(motivo: MotivoNoPublicable) {
    super(MENSAJE_POR_MOTIVO[motivo]);
  }
}
