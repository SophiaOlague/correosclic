export interface PreparedOrderItem {
  productoVarianteId: string;
  vendedorId: string;
  nombreTienda: string;
  nombreProducto: string;
  sku: string;
  imagenUrl: string | null;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  pesoKg: number;
}

export interface PreparedOrderVendor {
  vendedorId: string;
  subtotal: number;
  costoEnvioAsignado: number;
  comisionMarketplace: number;
  totalPedido: number;
}

export interface PreparedOrder {
  clienteId: string;
  direccionEntregaId: string;
  codigoPedido: string;
  subtotal: number;
  costoEnvio: number;
  comisionCorreosClic: number;
  totalVendedores: number;
  total: number;
  items: PreparedOrderItem[];
  vendedores: PreparedOrderVendor[];
}
