import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { checkoutApi } from '@/services/api/checkout.api';
import type { CheckoutSummaryDto, VendorGroup } from '@/types/checkout';

export const checkoutKeys = {
  all: ['checkout'] as const,
  addresses: () => [...checkoutKeys.all, 'addresses'] as const,
  summary: (direccionId?: string) => [...checkoutKeys.all, 'summary', direccionId ?? null] as const,
};

export function useCheckoutAddresses() {
  return useQuery({
    queryKey: checkoutKeys.addresses(),
    queryFn: () => checkoutApi.listAddresses(),
    staleTime: 5 * 60_000,
  });
}

/**
 * Resumen de checkout para una dirección concreta.
 *
 * Cambiar de dirección cambia la clave de caché, así que el recálculo lo
 * dispara TanStack Query solo. `placeholderData` mantiene el resumen anterior
 * en pantalla mientras llega el nuevo, en vez de vaciar la pantalla.
 *
 * Sin reintentos: los errores de este endpoint son de negocio (carrito vacío,
 * sin dirección, sin tarifa para la zona) y repetir la petición no los arregla.
 */
export function useCheckoutSummary(direccionId?: string) {
  return useQuery({
    queryKey: checkoutKeys.summary(direccionId),
    queryFn: () => checkoutApi.getSummary(direccionId),
    placeholderData: (previous) => previous,
    retry: false,
  });
}

/**
 * Agrupa los items por vendedor y les adjunta su cotización de envío.
 *
 * Es solo reorganización para presentar: no se calcula ningún importe. El
 * subtotal por vendedor se suma de los `item.subtotal` que ya vienen
 * calculados y redondeados por el backend.
 */
export function useVendorGroups(summary: CheckoutSummaryDto | undefined): VendorGroup[] {
  return useMemo(() => {
    if (!summary) return [];

    const groups = new Map<string, VendorGroup>();

    for (const item of summary.items) {
      const existing = groups.get(item.vendedorId);

      if (existing) {
        existing.items.push(item);
      } else {
        groups.set(item.vendedorId, {
          vendedorId: item.vendedorId,
          nombreTienda: item.nombreTienda,
          items: [item],
          envio: summary.envioDetalle.find(
            (quote) => quote.vendedorId === item.vendedorId,
          ),
        });
      }
    }

    return [...groups.values()];
  }, [summary]);
}
