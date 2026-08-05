import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Pencil, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import type { SystemConfigEntryDto } from '@/types/admin';

import { formatAdminDateTime } from '../lib/admin-format';
import { systemConfigMeta } from '../lib/system-config';
import { systemConfigValueSchema, type SystemConfigFormValues } from '../schemas/admin.schemas';

/**
 * Una clave de configuración, con su valor y su edición en línea.
 *
 * El valor viaja siempre como texto —`ConfiguracionSistema.valor` es
 * `VarChar(255)`— y el backend solo comprueba que no esté vacío. La validación
 * de forma se hace aquí porque quien lo lee llama a `getNumber`, y un texto no
 * numérico se convertiría en `NaN` dentro del total de un pedido.
 */
export function SystemConfigCard({
  entrada,
  isPending,
  onSave,
}: {
  entrada: SystemConfigEntryDto;
  isPending: boolean;
  onSave: (valor: string) => Promise<unknown>;
}) {
  const [editando, setEditando] = useState(false);
  const meta = systemConfigMeta(entrada.clave);

  const resolver = useMemo(
    () => zodResolver(systemConfigValueSchema(entrada.clave)),
    [entrada.clave],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SystemConfigFormValues>({
    resolver,
    values: { valor: entrada.valor },
  });

  const cancelar = () => {
    reset({ valor: entrada.valor });
    setEditando(false);
  };

  const guardar = handleSubmit(async (values) => {
    // Solo se cierra la edición si el backend aceptó el cambio: si responde
    // error, el campo se queda con lo escrito para poder corregirlo.
    try {
      await onSave(values.valor);
      setEditando(false);
    } catch {
      /* El aviso lo muestra la mutación. */
    }
  });

  return (
    <article className="bg-white rounded-2xl border border-border shadow-sm p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-bold text-foreground">{meta?.label ?? entrada.clave}</h3>

            {meta?.consumidor ? (
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                <Zap className="w-3 h-3" />
                En uso
              </span>
            ) : (
              <span className="bg-[#F5F6F8] text-muted-foreground text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                Sin consumidor
              </span>
            )}
          </div>

          <p className="text-xs font-mono text-muted-foreground">{entrada.clave}</p>
        </div>

        {!editando && (
          <button
            onClick={() => setEditando(true)}
            className="inline-flex items-center gap-1.5 bg-white border border-border text-foreground px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#F5F6F8] transition-colors shrink-0"
          >
            <Pencil className="w-3.5 h-3.5" />
            Editar
          </button>
        )}
      </div>

      {/* La descripción es la que guarda el propio registro, no una inventada. */}
      {entrada.descripcion && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          {entrada.descripcion}
        </p>
      )}

      {meta && (
        <p className="text-xs text-muted-foreground leading-relaxed bg-[#F5F6F8] rounded-xl px-4 py-3 mb-5">
          {meta.impacto}
        </p>
      )}

      {editando ? (
        <form noValidate onSubmit={guardar} className="space-y-4">
          <div>
            <label
              htmlFor={`valor-${entrada.clave}`}
              className="block text-xs font-bold text-foreground mb-2"
            >
              Nuevo valor {meta?.unidad && <span className="font-normal">({meta.unidad})</span>}
            </label>

            <input
              id={`valor-${entrada.clave}`}
              {...register('valor')}
              autoComplete="off"
              className="w-full max-w-xs bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all"
            />

            {errors.valor && (
              <p className="text-xs font-semibold text-destructive mt-1.5">
                {errors.valor.message}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="bg-primary text-white px-6 h-11 rounded-xl font-bold hover:bg-[#C4006A] transition-colors shadow-sm shadow-primary/20 inline-flex items-center gap-2 disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Guardar
            </button>

            <button
              type="button"
              onClick={cancelar}
              disabled={isPending}
              className="bg-white border border-border text-foreground px-6 h-11 rounded-xl font-bold hover:bg-[#F5F6F8] transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap items-end justify-between gap-4">
          <p className="text-2xl font-black text-foreground leading-none">
            {entrada.valor}
            {meta?.unidad && (
              <span className="text-sm font-bold text-muted-foreground ml-1.5">
                {meta.unidad}
              </span>
            )}
          </p>

          <p className="text-xs text-muted-foreground">
            Última modificación: {formatAdminDateTime(entrada.updatedAt)}
          </p>
        </div>
      )}
    </article>
  );
}
