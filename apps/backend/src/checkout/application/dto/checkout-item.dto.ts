export class CheckoutItemDto {
  productoId: string;

  productoVarianteId: string;

  vendedorId: string;

  nombreTienda: string;

  nombre: string;

  sku: string;

  imagen: string | null;

  atributos: string[];

  cantidad: number;

  precioUnitario: number;

  subtotal: number;

  pesoKg: number;
}