export class OrderDeliveryAddressDto {
  alias: string | null;
  calle: string;
  numeroExterior: string;
  numeroInterior: string | null;
  colonia: string | null;
  ciudad: string;
  estadoProvincia: string;
  codigoPostal: string;
  direccionFormateada: string | null;
}

export class OrderItemDetailDto {
  productoVarianteId: string;
  nombreProducto: string;
  sku: string;
  imagenUrl: string | null;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  pesoKg: number;
}

export class OrderVendorGroupDto {
  vendedorId: string;
  nombreTienda: string;
  /** Estado de procesamiento de la porción de este vendedor (independiente del estado global). */
  estado: string;
  subtotal: number;
  costoEnvioAsignado: number;
  comisionMarketplace: number;
  totalPedido: number;
  items: OrderItemDetailDto[];
}

export class OrderFinancialSummaryDto {
  subtotal: number;
  costoEnvio: number;
  comisionCorreosClic: number;
  totalVendedores: number;
  total: number;
}

export class OrderDetailDto {
  orderId: string;
  orderNumber: string;
  /** Estado global del pedido. */
  estado: string;
  fecha: Date;
  fechaPago: Date | null;
  direccionEntrega: OrderDeliveryAddressDto;
  resumenFinanciero: OrderFinancialSummaryDto;
  vendedores: OrderVendorGroupDto[];
}
