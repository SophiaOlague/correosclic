import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useForm } from 'react-hook-form';

import {
  rejectSellerRequestSchema,
  type RejectSellerRequestFormValues,
} from '../schemas/admin.schemas';

const MAX_COMENTARIOS = 500;

/**
 * Rechazo: el motivo es obligatorio (`@IsNotEmpty`, máx. 500).
 *
 * Ese texto es lo único que el solicitante recibe: `GET /seller/requests/me` se
 * lo devuelve en `comentariosRevision`. Y como la información fiscal no se
 * puede editar —`addFiscalInformation` responde 409 si ya existe y no hay
 * PATCH—, tras el rechazo tendrá que iniciar una solicitud nueva y capturarlo
 * todo otra vez, así que el motivo tiene que decirle exactamente qué corregir.
 */
export function RejectRequestForm({
  isPending,
  onSubmit,
  onCancel,
}: {
  isPending: boolean;
  onSubmit: (comentariosRevision: string) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RejectSellerRequestFormValues>({
    resolver: zodResolver(rejectSellerRequestSchema),
    defaultValues: { comentariosRevision: '' },
  });

  const escritos = watch('comentariosRevision')?.length ?? 0;

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => onSubmit(values.comentariosRevision))}
      className="space-y-5"
    >
      <div className="flex gap-3 bg-destructive/5 border border-destructive/20 rounded-xl p-4">
        <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        <div className="text-xs text-foreground leading-relaxed">
          <p className="font-bold mb-1">El rechazo no se puede deshacer.</p>
          <p>
            La solicitud queda finalizada. El solicitante no puede corregir su información
            fiscal, así que para volver a intentarlo tendrá que iniciar una solicitud
            nueva desde cero.
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="comentariosRevision"
          className="block text-xs font-bold text-foreground mb-2"
        >
          Motivo del rechazo <span className="text-destructive">*</span>
        </label>

        <textarea
          id="comentariosRevision"
          rows={5}
          maxLength={MAX_COMENTARIOS}
          {...register('comentariosRevision')}
          placeholder="Ej. La constancia de situación fiscal no corresponde al RFC declarado."
          className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all resize-y"
        />

        <div className="flex justify-between gap-4 mt-1.5">
          {errors.comentariosRevision ? (
            <p className="text-xs font-semibold text-destructive">
              {errors.comentariosRevision.message}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              El solicitante verá este texto tal cual.
            </p>
          )}

          <span className="text-xs text-muted-foreground shrink-0">
            {escritos}/{MAX_COMENTARIOS}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
        <button
          type="submit"
          disabled={isPending}
          className="bg-destructive text-white px-6 h-12 rounded-xl font-bold hover:bg-destructive/90 transition-colors shadow-sm inline-flex items-center gap-2 disabled:opacity-50"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Confirmar rechazo
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
