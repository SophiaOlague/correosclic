import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

import { orderKeys } from '@/features/orders/hooks/useOrders';
import { paymentsApi } from '@/services/api/payments.api';
import { ApiError } from '@/services/http';
import { isTerminalPaymentState } from '@/types/payment';

export const paymentKeys = {
  all: ['payments'] as const,
  status: (orderId: string) => [...paymentKeys.all, 'status', orderId] as const,
};

/** Cada 2 s, hasta 20 s: 10 intentos como máximo. */
export const POLL_INTERVAL_MS = 2_000;
export const POLL_TIMEOUT_MS = 20_000;
const MAX_POLLS = POLL_TIMEOUT_MS / POLL_INTERVAL_MS;

/**
 * `POST /payments/intent`.
 *
 * El backend decide crear o reutilizar; aquí solo se pide. La respuesta —con
 * el `clientSecret`— **no se guarda en la caché de TanStack Query ni en ningún
 * almacenamiento**: vive en el estado del componente el tiempo que dura el
 * formulario, y desaparece al desmontarlo.
 */
export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (orderId: string) => paymentsApi.createIntent(orderId),
  });
}

/**
 * Estado del pago según el backend — la única fuente de verdad.
 *
 * Mientras `enabled` esté activo, se consulta cada 2 s. El sondeo se detiene
 * solo en cuanto llega un estado terminal (EXITOSO, FALLIDO, CANCELADO,
 * REEMBOLSADO) o al agotarse los 20 s, lo que ocurra primero.
 *
 * El 404 es esperable: significa que todavía no hay pago registrado para el
 * pedido, no que algo haya fallado.
 */
export function usePaymentStatus(orderId: string | undefined, enabled: boolean) {
  const queryClient = useQueryClient();
  const polls = useRef(0);

  const query = useQuery({
    queryKey: paymentKeys.status(orderId ?? ''),
    queryFn: async () => {
      polls.current += 1;

      const status = await paymentsApi.getStatus(orderId!);

      // Al confirmarse el pago, el pedido pasó a PAGADO en el backend: hay
      // que releer Orders para no seguir mostrando PENDIENTE_PAGO.
      if (isTerminalPaymentState(status.status)) {
        queryClient.invalidateQueries({ queryKey: orderKeys.all });
      }

      return status;
    },

    enabled: Boolean(orderId) && enabled,
    retry: false,

    // Por defecto TanStack pausa los intervalos cuando la pestaña deja de estar
    // visible. Aquí no conviene: si el usuario cambia de pestaña mientras se
    // confirma el cobro, el sondeo debe seguir para no dejarlo colgado.
    refetchIntervalInBackground: true,

    refetchInterval: (q) => {
      const estado = q.state.data?.status;

      if (estado && isTerminalPaymentState(estado)) return false;
      if (polls.current >= MAX_POLLS) return false;

      return POLL_INTERVAL_MS;
    },
  });

  const agotado = polls.current >= MAX_POLLS;
  const estado = query.data?.status;
  const esTerminal = Boolean(estado && isTerminalPaymentState(estado));

  return {
    ...query,
    /** `true` si el 404 solo indica que aún no hay pago registrado. */
    sinPagoTodavia: query.error instanceof ApiError && query.error.isNotFound,
    esTerminal,
    /** Se agotaron los 20 s sin un estado definitivo. */
    tiempoAgotado: agotado && !esTerminal,

    /**
     * Prepara un intento nuevo. Además de reiniciar el contador, **borra el
     * estado en caché**: si se conservara el FALLIDO anterior, la pantalla
     * seguiría mostrando el rechazo mientras el pago nuevo está en curso,
     * porque un estado terminal detiene el sondeo antes de la primera consulta.
     */
    reiniciarSondeo: () => {
      polls.current = 0;
      queryClient.removeQueries({ queryKey: paymentKeys.status(orderId ?? '') });
    },
  };
}
