import { Injectable } from '@nestjs/common';

/** Lo mínimo que hay que saber de una variante para decidir si se puede vender. */
export interface VariantSalability {
  activa: boolean;
  /** null cuando la variante todavía no tiene inventario creado. */
  stockDisponible: number | null;
}

export type PublicationCheck =
  | { publicable: true }
  | { publicable: false; motivo: MotivoNoPublicable };

export enum MotivoNoPublicable {
  SIN_VARIANTES = 'SIN_VARIANTES',
  SIN_INVENTARIO = 'SIN_INVENTARIO',
  SIN_STOCK = 'SIN_STOCK',
}

/**
 * Decide si un producto está listo para publicarse.
 *
 * Publicar es hacerlo visible y comprable, así que la regla es exactamente la
 * que el carrito exige para aceptar una variante
 * (`ShoppingCartService.getValidVariant`): variante activa, con inventario
 * registrado y con stock disponible. Publicar sin cumplirla dejaría en el
 * catálogo un producto que el cliente no puede comprar.
 *
 * Retirar de publicación no pasa por aquí: siempre debe poder hacerse.
 */
@Injectable()
export class ProductPublicationPolicy {
  puedePublicarse(variantes: VariantSalability[]): PublicationCheck {

    const activas = variantes.filter((variante) => variante.activa);

    if (activas.length === 0) {
      return { publicable: false, motivo: MotivoNoPublicable.SIN_VARIANTES };
    }

    const conInventario = activas.filter(
      (variante) => variante.stockDisponible !== null,
    );

    if (conInventario.length === 0) {
      return { publicable: false, motivo: MotivoNoPublicable.SIN_INVENTARIO };
    }

    const conStock = conInventario.some(
      (variante) => (variante.stockDisponible ?? 0) > 0,
    );

    if (!conStock) {
      return { publicable: false, motivo: MotivoNoPublicable.SIN_STOCK };
    }

    return { publicable: true };
  }
}
