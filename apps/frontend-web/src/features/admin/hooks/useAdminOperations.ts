import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { adminApi } from '@/services/api/admin.api';
import type { SystemConfigEntryDto } from '@/types/admin';

import { adminKeys, mensajeDeError } from './useAdminSellerRequests';

/** Sucursales — `GET /admin/branches`. Solo lectura. */
export function useAdminBranches() {
  return useQuery({
    queryKey: adminKeys.branches(),
    queryFn: () => adminApi.listBranches(),
  });
}

/** Vehículos — `GET /admin/vehicles`. Solo lectura. */
export function useAdminVehicles() {
  return useQuery({
    queryKey: adminKeys.vehicles(),
    queryFn: () => adminApi.listVehicles(),
  });
}

/** Configuración — `GET /admin/system-config`. */
export function useSystemConfig() {
  return useQuery({
    queryKey: adminKeys.systemConfig(),
    queryFn: () => adminApi.listSystemConfig(),
  });
}

/**
 * `PATCH /admin/system-config/:clave`.
 *
 * El endpoint devuelve la entrada completa ya actualizada —clave, valor,
 * descripción y `updatedAt`—, así que se sustituye en la lista cacheada en vez
 * de invalidar y volver a pedir las siete claves.
 */
export function useUpdateSystemConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clave, valor }: { clave: string; valor: string }) =>
      adminApi.updateSystemConfig(clave, { valor }),

    onSuccess: (actualizada) => {
      queryClient.setQueryData<SystemConfigEntryDto[]>(
        adminKeys.systemConfig(),
        (anteriores) =>
          anteriores?.map((entrada) =>
            entrada.clave === actualizada.clave ? actualizada : entrada,
          ),
      );

      toast.success(`${actualizada.clave} quedó en ${actualizada.valor}.`);
    },

    onError: (error) =>
      toast.error(mensajeDeError(error, 'No pudimos guardar el nuevo valor.')),
  });
}
