import { GeoCoordinates } from '../../domain/services/haversine-distance.calculator';

export interface ShippingCalculationItem {
  vendedorId: string;
  estadoOperacion: GeoCoordinates;
  pesoKg: number;
  cantidad: number;
}

export interface VendorShippingQuote {
  vendedorId: string;
  pesoKg: number;
  distanciaKm: number;
  zonaTarifariaCodigo: string;
  tarifa: number;
}

export interface ShippingCalculationResult {
  costoEnvio: number;
  cotizacionesPorVendedor: VendorShippingQuote[];
}
