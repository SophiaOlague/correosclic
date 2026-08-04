import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { logisticsApi } from '@/services/api/logistics.api';
import { ApiError, NetworkError } from '@/services/http';
import type { RecordDeliveryAttemptRequest, ShipmentDetailDto } from '@/types/logistics';

import { logisticsKeys, useShipmentCacheSync } from './useShipments';

/**
 * Entregas asignadas al repartidor — `GET /logistics/couriers/me/deliveries`.
 *
 * Solo las que siguen abiertas: el backend filtra por envíos en `EN_REPARTO`,
 * que es justo la fase en la que se pueden registrar intentos. Una entrega sale
 * de la lista en cuanto alcanza cualquier desenlace —entregada, devuelta,
 * cancelada o extraviada—.
 */
export function useMyDeliveries() {
  return useQuery({
    queryKey: logisticsKeys.courierDeliveries(),
    queryFn: () => logisticsApi.listMyDeliveries(),
    retry: false,
  });
}

/**
 * Registro de un intento de entrega — `POST /logistics/deliveries/:id/attempts`.
 *
 * El repartidor informa **qué pasó**, no a qué estado debe ir el envío. Con un
 * resultado fallido, `DeliveryRetryPolicy` compara el número de intento contra
 * `MAX_DELIVERY_ATTEMPTS` y decide si toca reintentar o devolver al remitente.
 * Por eso el mensaje de confirmación se redacta a partir del estado que
 * respondió el backend, no del resultado que se envió.
 */
export function useRecordDeliveryAttempt(onRecorded?: (envio: ShipmentDetailDto) => void) {
  const syncShipment = useShipmentCacheSync();

  return useMutation({
    mutationFn: ({
      entregaId,
      body,
    }: {
      entregaId: string;
      body: RecordDeliveryAttemptRequest;
    }) => logisticsApi.recordDeliveryAttempt(entregaId, body),

    onSuccess: (envio) => {
      syncShipment(envio);

      if (envio.estado === 'ENTREGADO') {
        toast.success(`Entrega confirmada para ${envio.trackingInterno}.`);
      } else if (envio.estado === 'DEVUELTO') {
        toast.warning(
          `Se agotaron los intentos: ${envio.trackingInterno} se devuelve al remitente.`,
        );
      } else {
        toast.info(`Intento registrado para ${envio.trackingInterno}. Se reintentará.`);
      }

      onRecorded?.(envio);
    },

    onError: (error) => {
      if (error instanceof NetworkError) {
        toast.error(error.message);
        return;
      }

      if (!(error instanceof ApiError)) {
        toast.error('Ocurrió un error inesperado al registrar el intento.');
        return;
      }

      if (error.isNotFound) {
        toast.error('Esa entrega ya no está asignada a ti.');
        return;
      }

      // 409: el envío dejó de estar EN_REPARTO entre que se abrió la pantalla
      // y se envió el intento.
      toast.error(error.message);
    },
  });
}
