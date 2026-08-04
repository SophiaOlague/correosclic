import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { logisticsApi } from '@/services/api/logistics.api';
import { ApiError, NetworkError } from '@/services/http';
import type { ConfirmReceptionRequest, ShipmentDetailDto } from '@/types/logistics';

import { logisticsKeys, useShipmentCacheSync } from './useShipments';

/**
 * Sucursal del empleado autenticado — `GET /logistics/branches/me`.
 *
 * Es la primera consulta del panel de sucursal: todas las demás rutas de
 * operación reciben el `sucursalId` en la ruta y comprueban que coincida con
 * el del empleado, así que sin esto no hay panel.
 */
export function useMyBranch() {
  return useQuery({
    queryKey: logisticsKeys.branch(),
    queryFn: () => logisticsApi.getMyBranch(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

/** Cola de recepción de la sucursal — envíos en `PENDIENTE_RECEPCION`. */
export function useReceptionQueue(sucursalId: string | undefined) {
  return useQuery({
    queryKey: logisticsKeys.receptionQueue(sucursalId ?? ''),
    queryFn: () => logisticsApi.listReceptionQueue(sucursalId!),
    enabled: Boolean(sucursalId),
    retry: false,
  });
}

/** Cola de despacho — envíos en `CLASIFICADO` esperando vehículo. */
export function useDispatchQueue(sucursalId: string | undefined) {
  return useQuery({
    queryKey: logisticsKeys.dispatchQueue(sucursalId ?? ''),
    queryFn: () => logisticsApi.listDispatchQueue(sucursalId!),
    enabled: Boolean(sucursalId),
    retry: false,
  });
}

/**
 * Confirmación de recepción — `POST /logistics/reception`.
 *
 * El recepcionista solo certifica el hecho físico. Si acepta el paquete, el
 * orquestador encadena clasificación, ruta y asignación de repartidor dentro
 * de la misma petición, así que la respuesta puede llegar ya en `EN_TRANSITO`
 * o `EN_REPARTO`. Si certifica daño o rechazo, el envío queda en su estado
 * terminal y no entra a la red.
 */
export function useConfirmReception(onConfirmed?: (envio: ShipmentDetailDto) => void) {
  const syncShipment = useShipmentCacheSync();

  return useMutation({
    mutationFn: (body: ConfirmReceptionRequest) => logisticsApi.confirmReception(body),

    onSuccess: (envio) => {
      syncShipment(envio);
      onConfirmed?.(envio);
    },

    onError: (error) => {
      if (error instanceof NetworkError) {
        toast.error(error.message);
        return;
      }

      if (!(error instanceof ApiError)) {
        toast.error('Ocurrió un error inesperado al registrar la recepción.');
        return;
      }

      // 404: la guía no existe o no pertenece a esta sucursal. El backend no
      // distingue entre ambos casos a propósito.
      if (error.isNotFound) {
        toast.error('No encontramos esa guía en tu sucursal.');
        return;
      }

      // 409: la guía ya se había procesado (doble escaneo).
      toast.error(error.message);
    },
  });
}

/**
 * Reintento manual de planificación — `POST /logistics/shipments/:id/retry-planning`.
 *
 * Solo tiene sentido cuando el motor se quedó esperando: sin vehículo para la
 * transferencia (`CLASIFICADO`) o sin repartidor libre (`EN_SUCURSAL_DESTINO`).
 */
export function useRetryPlanning() {
  const syncShipment = useShipmentCacheSync();

  return useMutation({
    mutationFn: (shipmentId: string) => logisticsApi.retryPlanning(shipmentId),

    onSuccess: (envio) => {
      syncShipment(envio);
      toast.success(`Planificación reintentada para ${envio.trackingInterno}.`);
    },

    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : 'No pudimos reintentar la planificación.',
      );
    },
  });
}

/** Llegada de una transferencia — la confirma la sucursal **destino**. */
export function useConfirmTransferArrival() {
  const syncShipment = useShipmentCacheSync();

  return useMutation({
    mutationFn: (transferenciaId: string) =>
      logisticsApi.confirmTransferArrival(transferenciaId),

    onSuccess: (envio) => {
      syncShipment(envio);
      toast.success(`Llegada confirmada para ${envio.trackingInterno}.`);
    },

    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'No pudimos confirmar la llegada.',
      );
    },
  });
}
