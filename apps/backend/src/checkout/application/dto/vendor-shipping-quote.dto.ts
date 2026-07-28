export class VendorShippingQuoteDto {
  vendedorId: string;
  nombreTienda: string;
  pesoKg: number;
  distanciaKm: number;
  zonaTarifariaCodigo: string;
  tarifa: number;
  esTarifaBase: boolean;
  recargoAplicado?: number;
}
