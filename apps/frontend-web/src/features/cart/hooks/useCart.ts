import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/useAuth';
import { cartApi } from '@/services/api/cart.api';
import { ApiError, NetworkError } from '@/services/http';
import type { AddCartItemPayload, CartDto } from '@/types/cart';

export const cartKeys = {
  all: ['cart'] as const,
  detail: () => [...cartKeys.all, 'detail'] as const,
};

/**
 * Estado del carrito.
 *
 * TanStack Query es la **única** fuente de verdad: no hay copia local que
 * pueda desincronizarse. Cada mutación devuelve el carrito completo recalculado
 * por el backend y ese objeto se escribe tal cual en la caché, así que la
 * interfaz siempre muestra lo que la API acaba de confirmar.
 *
 * Deliberadamente **sin actualizaciones optimistas**: primero corrección, y ya
 * habrá tiempo de afinar la experiencia sobre una base que funciona.
 */
export function useCart() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: cartKeys.detail(),
    queryFn: () => cartApi.get(),
    // El endpoint exige JWT; sin sesión ni siquiera se intenta.
    enabled: isAuthenticated,
  });
}

/** Número de artículos, para el contador de la navbar. */
export function useCartItemCount(): number {
  const { data } = useCart();

  return data?.items.reduce((total, item) => total + item.cantidad, 0) ?? 0;
}

function useCartMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<CartDto>,
  options?: { onSuccessMessage?: (variables: TVariables) => string },
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,

    onSuccess: (cart, variables) => {
      // La respuesta ES el estado nuevo: se escribe directamente en la caché.
      queryClient.setQueryData(cartKeys.detail(), cart);

      const message = options?.onSuccessMessage?.(variables);
      if (message) toast.success(message);
    },

    onError: (error) => {
      if (error instanceof NetworkError) {
        toast.error(error.message);
        return;
      }

      if (error instanceof ApiError) {
        // El backend ya redacta los mensajes en español y con el detalle útil,
        // por ejemplo "Stock insuficiente. Solo hay 3 unidades disponibles."
        toast.error(error.message);
        return;
      }

      toast.error('No pudimos actualizar tu carrito. Inténtalo de nuevo.');
    },

    onSettled: () => {
      // Red de seguridad: si algo llegó a divergir, se vuelve a leer del backend.
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
    },
  });
}

export function useAddCartItem() {
  return useCartMutation<AddCartItemPayload>((payload) => cartApi.addItem(payload), {
    onSuccessMessage: () => 'Producto agregado al carrito',
  });
}

export function useUpdateCartItem() {
  return useCartMutation<{ itemId: string; cantidad: number }>(({ itemId, cantidad }) =>
    cartApi.updateItem(itemId, cantidad),
  );
}

export function useRemoveCartItem() {
  return useCartMutation<string>((itemId) => cartApi.removeItem(itemId), {
    onSuccessMessage: () => 'Producto eliminado del carrito',
  });
}

export function useClearCart() {
  return useCartMutation<void>(() => cartApi.clear(), {
    onSuccessMessage: () => 'Carrito vaciado',
  });
}
