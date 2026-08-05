import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { logisticsApi } from '@/services/api/logistics.api';
import { ApiError } from '@/services/http';
import type { ShipmentDetailDto } from '@/types/logistics';

export const logisticsKeys = {
  all: ['logistics'] as const,

  /** Envíos de un pedido, para el cliente. */
  order: (pedidoId: string) => [...logisticsKeys.all, 'order', pedidoId] as const,

  /** Detalle de un envío. Lo comparten cliente, vendedor y repartidor. */
  shipment: (shipmentId: string) => [...logisticsKeys.all, 'shipment', shipmentId] as const,

  vendorPending: () => [...logisticsKeys.all, 'vendor', 'pending'] as const,

  branch: () => [...logisticsKeys.all, 'branch'] as const,
  receptionQueue: (sucursalId: string) =>
    [...logisticsKeys.all, 'branch', sucursalId, 'reception-queue'] as const,
  dispatchQueue: (sucursalId: string) =>
    [...logisticsKeys.all, 'branch', sucursalId, 'dispatch-queue'] as const,

  courierDeliveries: () => [...logisticsKeys.all, 'courier', 'deliveries'] as const,
};

/**
 * Envíos de un pedido — `GET /logistics/orders/:pedidoId/shipments`.
 *
 * Devuelve uno por cada `PedidoVendedor`. Una lista vacía **no es un error**:
 * significa que el pedido todavía no tiene guías generadas.
 */
export function useOrderShipments(pedidoId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: logisticsKeys.order(pedidoId ?? ''),
    queryFn: () => logisticsApi.listByOrder(pedidoId!),
    enabled: Boolean(pedidoId) && enabled,
    retry: false,
  });
}

/** Detalle de un envío — `GET /logistics/shipments/:id`. */
export function useShipment(shipmentId: string | undefined) {
  return useQuery({
    queryKey: logisticsKeys.shipment(shipmentId ?? ''),
    queryFn: () => logisticsApi.getShipment(shipmentId!),
    enabled: Boolean(shipmentId),
    retry: false,
  });
}

/** Envíos que el vendedor aún no ha llevado a sucursal. */
export function useVendorPendingShipments() {
  return useQuery({
    queryKey: logisticsKeys.vendorPending(),
    queryFn: () => logisticsApi.listVendorPending(),
    retry: false,
  });
}

/**
 * Todas las mutaciones de Logistics devuelven el `ShipmentResponseDto`
 * completo y actualizado. Escribir esa respuesta en la caché del detalle evita
 * una segunda petición y, sobre todo, evita reconstruir el estado a mano: lo
 * que se muestra es literalmente lo que respondió el backend.
 *
 * Las listas sí se invalidan, porque el cambio de estado puede sacar al envío
 * de una cola y meterlo en otra, y eso solo lo sabe el backend.
 */
export function useShipmentCacheSync() {
  const queryClient = useQueryClient();

  return (envio: ShipmentDetailDto) => syncShipment(queryClient, envio);
}

function syncShipment(queryClient: QueryClient, envio: ShipmentDetailDto) {
  queryClient.setQueryData(logisticsKeys.shipment(envio.id), envio);

  // Se invalidan las listas, no el detalle: invalidar `logisticsKeys.all`
  // marcaría como obsoleta la respuesta que se acaba de escribir y provocaría
  // una relectura inmediata del mismo recurso.
  queryClient.invalidateQueries({
    queryKey: logisticsKeys.all,
    predicate: (query) => query.queryKey[1] !== 'shipment',
  });
}

/** Un 404 aquí significa "este usuario no es ese actor", no un fallo real. */
export function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.isNotFound;
}
