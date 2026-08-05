/**
 * Contratos de Orders. Espejo de
 * `apps/backend/src/orders/application/dto/`.
 *
 * El pedido guarda **instantáneas**: `nombreProducto`, `sku`, `precioUnitario`
 * y los importes se copian al crearlo y no se recalculan nunca después, así que
 * un cambio posterior de precio o de catálogo no altera un pedido existente.
 */

/** Estados de `EstadoPedido` en Prisma. */
export const ORDER_STATES = [
  'PENDIENTE_PAGO',
  'PAGADO',
  'PREPARANDO',
  'ENVIADO',
  'ENTREGADO',
  'CANCELADO',
  'REEMBOLSADO',
] as const;

export type OrderState = (typeof ORDER_STATES)[number];

/** Respuesta de `POST /orders`. */
export interface OrderSummaryDto {
  orderId: string;
  orderNumber: string;
  status: string;
  total: number;
  /** El backend siempre lo devuelve en `true`: el pedido nace PENDIENTE_PAGO. */
  paymentRequired: boolean;
}

/** Espejo de `OrderListItemDto`. */
export interface OrderListItemDto {
  orderId: string;
  orderNumber: string;
  /** ISO 8601; el backend serializa un `Date`. */
  fecha: string;
  estado: string;
  total: number;
  cantidadArticulos: number;
  numeroVendedores: number;
  miniaturaUrl: string | null;
}

/** Espejo de `OrderListResponseDto`. */
export interface OrderListResponseDto {
  orders: OrderListItemDto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Espejo de `OrderDeliveryAddressDto`. */
export interface OrderDeliveryAddressDto {
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

/** Espejo de `OrderItemDetailDto`. */
export interface OrderItemDetailDto {
  productoVarianteId: string;
  nombreProducto: string;
  sku: string;
  imagenUrl: string | null;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  pesoKg: number;
}

/**
 * Espejo de `OrderVendorGroupDto` — un `PedidoVendedor`.
 *
 * `estado` es el del vendedor (`EstadoPedidoVendedor`) y avanza independiente
 * del estado global: cada vendedor prepara y envía a su ritmo dentro del mismo
 * pedido.
 */
export interface OrderVendorGroupDto {
  vendedorId: string;
  nombreTienda: string;
  estado: string;
  subtotal: number;
  costoEnvioAsignado: number;
  /** Lo que CorreosClic descuenta a este vendedor. No lo paga el cliente. */
  comisionMarketplace: number;
  totalPedido: number;
  items: OrderItemDetailDto[];
}

/** Espejo de `OrderFinancialSummaryDto`. */
export interface OrderFinancialSummaryDto {
  subtotal: number;
  costoEnvio: number;
  comisionCorreosClic: number;
  totalVendedores: number;
  total: number;
}

/** Espejo de `OrderDetailDto`. */
export interface OrderDetailDto {
  orderId: string;
  orderNumber: string;
  estado: string;
  fecha: string;
  fechaPago: string | null;
  direccionEntrega: OrderDeliveryAddressDto;
  resumenFinanciero: OrderFinancialSummaryDto;
  vendedores: OrderVendorGroupDto[];
}
