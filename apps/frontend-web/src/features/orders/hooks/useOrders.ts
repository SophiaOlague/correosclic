import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { cartKeys } from '@/features/cart/hooks/useCart';
import { checkoutKeys } from '@/features/checkout/hooks/useCheckout';
import { ordersApi } from '@/services/api/orders.api';
import { ApiError, NetworkError, releaseIdempotencyKey } from '@/services/http';
import type { OrderSummaryDto } from '@/types/order';

/** Segundo envío del mismo pedido, cortado antes de salir a la red. */
class DuplicateSubmitError extends Error {
  constructor() {
    super('Ya hay un pedido en curso.');
    this.name = 'DuplicateSubmitError';
  }
}

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (page: number, limit: number) => [...orderKeys.lists(), page, limit] as const,
  detail: (orderId: string) => [...orderKeys.all, 'detail', orderId] as const,
};

export function useOrders(page: number, limit: number) {
  return useQuery({
    queryKey: orderKeys.list(page, limit),
    queryFn: () => ordersApi.list(page, limit),
    placeholderData: (previous) => previous,
  });
}

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: orderKeys.detail(orderId ?? ''),
    queryFn: () => ordersApi.getById(orderId!),
    enabled: Boolean(orderId),
    retry: false,
  });
}

/**
 * Creación del pedido: `POST /orders`.
 *
 * El `scope` de idempotencia incluye la dirección porque el interceptor del
 * backend calcula una huella del body: reutilizar la misma clave con un
 * `direccionId` distinto devolvería 422. Al cambiar de dirección, cambia el
 * scope y con él la clave.
 *
 * En cuanto el pedido se crea, la clave se libera para que la siguiente compra
 * arranque con una nueva; el carrito y el checkout se invalidan porque el
 * backend los dejó vacíos dentro de la misma transacción.
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  /**
   * `isPending` se actualiza en el siguiente render, así que dos clics en el
   * mismo tick lo esquivan. Este cerrojo se pone de forma síncrona y evita que
   * la segunda petición llegue siquiera a salir. La idempotencia del backend
   * sigue siendo la red de seguridad para reintentos de red.
   */
  const enVuelo = useRef(false);

  return useMutation({
    mutationFn: ({ scope, direccionId }: { scope: string; direccionId?: string }) => {
      if (enVuelo.current) {
        return Promise.reject(new DuplicateSubmitError());
      }

      enVuelo.current = true;

      return ordersApi.create(scope, direccionId);
    },

    onSettled: () => {
      enVuelo.current = false;
    },

    onSuccess: (order: OrderSummaryDto, variables) => {
      releaseIdempotencyKey(variables.scope);

      queryClient.removeQueries({ queryKey: cartKeys.all });
      queryClient.removeQueries({ queryKey: checkoutKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

      toast.success(`Pedido ${order.orderNumber} creado`);

      navigate(`/mis-pedidos/${order.orderId}`, { replace: true });
    },

    onError: (error) => {
      // Segundo clic del mismo envío: no es un fallo que deba ver el usuario.
      if (error instanceof DuplicateSubmitError) return;

      // El backend detectó el envío duplicado antes que nosotros. Tampoco es
      // un error real: la primera petición sigue su curso.
      if (error instanceof ApiError && error.isConflict && error.warnings.length === 0) {
        return;
      }

      if (error instanceof NetworkError) {
        // La clave NO se libera: el pedido pudo haberse creado sin que llegara
        // la respuesta, y reintentar con la misma clave devuelve ese pedido en
        // vez de duplicarlo.
        toast.error('No pudimos confirmar tu pedido. Revisa tu conexión y vuelve a intentarlo.');
        return;
      }

      if (!(error instanceof ApiError)) {
        toast.error('Ocurrió un error inesperado al crear tu pedido.');
        return;
      }

      // 409: el stock se agotó entre que se vio el checkout y se envió el
      // pedido. El backend detalla el motivo producto por producto.
      if (error.isConflict) {
        toast.error(error.message, {
          description: error.warnings.join(' '),
        });
        queryClient.invalidateQueries({ queryKey: checkoutKeys.all });
        queryClient.invalidateQueries({ queryKey: cartKeys.all });
        return;
      }

      toast.error(error.message);
    },
  });
}
