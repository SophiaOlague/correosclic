import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { adminApi } from '@/services/api/admin.api';
import { ApiError, NetworkError } from '@/services/http';
import type { ResolvedSellerRequestDto } from '@/types/admin';

export const adminKeys = {
  all: ['admin'] as const,
  sellerRequests: () => [...adminKeys.all, 'seller-requests'] as const,
  sellerRequest: (id: string) => [...adminKeys.sellerRequests(), id] as const,
  operatingStates: () => [...adminKeys.all, 'operating-states'] as const,
  branches: () => [...adminKeys.all, 'branches'] as const,
  vehicles: () => [...adminKeys.all, 'vehicles'] as const,
  systemConfig: () => [...adminKeys.all, 'system-config'] as const,
};

/** Mensaje legible para cualquier fallo de una mutación de Admin. */
export function mensajeDeError(error: unknown, generico: string): string {
  if (error instanceof NetworkError) return error.message;
  if (error instanceof ApiError) return error.message;

  return generico;
}

/** Cola de revisión — `GET /admin/seller-requests`. */
export function useSellerRequests() {
  return useQuery({
    queryKey: adminKeys.sellerRequests(),
    queryFn: () => adminApi.listSellerRequests(),
  });
}

/** Detalle — `GET /admin/seller-requests/:id`. */
export function useSellerRequest(id: string | undefined) {
  return useQuery({
    queryKey: adminKeys.sellerRequest(id ?? ''),
    queryFn: () => adminApi.getSellerRequest(id!),
    enabled: Boolean(id),
    retry: false,
  });
}

/**
 * Estados de operación — `GET /admin/operating-states`.
 *
 * La lista cambia con muy poca frecuencia y es la que habilita el botón de
 * aprobar, así que se carga junto al detalle en vez de al abrir el formulario.
 */
export function useOperatingStates(enabled = true) {
  return useQuery({
    queryKey: adminKeys.operatingStates(),
    queryFn: () => adminApi.listOperatingStates(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Tras resolver una solicitud hay que releer, no reconstruir.
 *
 * `approve` y `reject` devuelven el registro `SolicitudVendedor` actualizado,
 * que **no** es el recurso completo del detalle: no trae cliente, información
 * fiscal ni documentos. Escribirlo en la caché dejaría la pantalla a medias, y
 * además la aprobación tiene efectos que solo el servidor conoce (crea el
 * `Vendedor` y concede el rol), así que se invalida y se vuelve a pedir.
 */
function useRefreshRequest(id: string) {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: adminKeys.sellerRequest(id) });
    queryClient.invalidateQueries({ queryKey: adminKeys.sellerRequests() });
  };
}

/**
 * `PATCH /admin/seller-requests/:id/approve`.
 *
 * El backend responde 400 si el estado no existe, no está activo o no tiene
 * coordenadas, y 409 si la solicitud ya se revisó. Sus mensajes ya vienen
 * redactados en español y se muestran tal cual.
 */
export function useApproveSellerRequest(
  id: string,
  onResolved?: (solicitud: ResolvedSellerRequestDto) => void,
) {
  const refresh = useRefreshRequest(id);

  return useMutation({
    mutationFn: (estadoOperacionId: string) =>
      adminApi.approveSellerRequest(id, { estadoOperacionId }),

    onSuccess: (solicitud) => {
      refresh();
      toast.success('Solicitud aprobada. El vendedor ya puede crear su tienda.');
      onResolved?.(solicitud);
    },

    onError: (error) =>
      toast.error(mensajeDeError(error, 'No pudimos aprobar la solicitud.')),
  });
}

/** `PATCH /admin/seller-requests/:id/reject`. */
export function useRejectSellerRequest(
  id: string,
  onResolved?: (solicitud: ResolvedSellerRequestDto) => void,
) {
  const refresh = useRefreshRequest(id);

  return useMutation({
    mutationFn: (comentariosRevision: string) =>
      adminApi.rejectSellerRequest(id, { comentariosRevision }),

    onSuccess: (solicitud) => {
      refresh();
      toast.success('Solicitud rechazada. El solicitante verá el motivo.');
      onResolved?.(solicitud);
    },

    onError: (error) =>
      toast.error(mensajeDeError(error, 'No pudimos rechazar la solicitud.')),
  });
}
