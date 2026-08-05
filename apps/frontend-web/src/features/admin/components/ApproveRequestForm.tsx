import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, MapPin, ShieldAlert } from 'lucide-react';
import { useForm } from 'react-hook-form';

import type { OperatingStateDto } from '@/types/admin';

import {
  approveSellerRequestSchema,
  type ApproveSellerRequestFormValues,
} from '../schemas/admin.schemas';

/**
 * Aprobación: exige elegir el estado desde el que operará el vendedor.
 *
 * No es un dato administrativo de relleno. `ShipmentCreationService` toma las
 * coordenadas de ese estado para resolver la sucursal de origen de cada envío;
 * un `Vendedor` sin él deja sus pedidos pagados sin guía y el backend solo lo
 * registra como un aviso en el log. Por eso `ApproveSellerRequestDto` lo pide
 * y el formulario no ofrece forma de omitirlo.
 */
export function ApproveRequestForm({
  estados,
  isLoading,
  isError,
  isPending,
  onSubmit,
  onCancel,
}: {
  estados: OperatingStateDto[] | undefined;
  isLoading: boolean;
  isError: boolean;
  isPending: boolean;
  onSubmit: (estadoOperacionId: string) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ApproveSellerRequestFormValues>({
    resolver: zodResolver(approveSellerRequestSchema),
    defaultValues: { estadoOperacionId: '' },
  });

  const seleccionado = estados?.find((estado) => estado.id === watch('estadoOperacionId'));

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => onSubmit(values.estadoOperacionId))}
      className="space-y-5"
    >
      <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <p className="font-bold mb-1">La aprobación no se puede deshacer.</p>
          <p>
            Se crea el vendedor, se le concede el rol VENDEDOR y la solicitud queda
            finalizada. El estado que elijas fija el origen logístico de todos sus envíos.
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="estadoOperacionId"
          className="block text-xs font-bold text-foreground mb-2"
        >
          Estado de operación <span className="text-destructive">*</span>
        </label>

        {isLoading && <div className="h-12 bg-[#F5F6F8] rounded-xl animate-pulse" />}

        {isError && (
          <p className="text-xs font-semibold text-destructive">
            No pudimos cargar los estados disponibles. Recarga la página para volver a
            intentarlo.
          </p>
        )}

        {estados && estados.length === 0 && (
          <p className="text-xs font-semibold text-destructive leading-relaxed">
            No hay ningún estado activo con coordenadas registradas, así que ninguna
            aprobación podría generar envíos. Hay que registrarlas antes de continuar.
          </p>
        )}

        {estados && estados.length > 0 && (
          <>
            <select
              id="estadoOperacionId"
              {...register('estadoOperacionId')}
              className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all cursor-pointer"
            >
              <option value="">Selecciona un estado</option>
              {estados.map((estado) => (
                <option key={estado.id} value={estado.id}>
                  {estado.nombre}
                  {estado.codigo ? ` (${estado.codigo})` : ''}
                  {estado.region ? ` · ${estado.region.nombre}` : ''}
                </option>
              ))}
            </select>

            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Solo aparecen los estados activos y con coordenadas: son los únicos con los
              que el motor logístico puede planificar.
            </p>
          </>
        )}

        {errors.estadoOperacionId && (
          <p className="text-xs font-semibold text-destructive mt-1.5">
            {errors.estadoOperacionId.message}
          </p>
        )}
      </div>

      {seleccionado && (
        <div className="flex items-center gap-2 bg-[#006847]/10 text-[#006847] rounded-xl px-4 py-3 text-xs font-semibold">
          <MapPin className="w-4 h-4 shrink-0" />
          Los envíos de este vendedor saldrán desde {seleccionado.nombre}.
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
        <button
          type="submit"
          disabled={isPending || !estados || estados.length === 0}
          className="bg-[#006847] text-white px-6 h-12 rounded-xl font-bold hover:bg-[#005439] transition-colors shadow-sm inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Confirmar aprobación
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="bg-white border border-border text-foreground px-6 h-12 rounded-xl font-bold hover:bg-[#F5F6F8] transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
