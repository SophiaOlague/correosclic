import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Store } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { storeSchema, type StoreFormValues } from '../schemas/seller.schemas';

/**
 * Alta de la tienda, disponible solo tras la aprobación.
 *
 * `CreateStoreDto` solo acepta `nombre` y `descripcion`; el `codigoPublico` lo
 * genera el backend. Los campos de logotipo, teléfono y dirección que traía el
 * diseño no existen en `Tienda` como datos capturables aquí, así que se omiten.
 */
export function StoreForm({
  isPending,
  onSubmit,
}: {
  isPending: boolean;
  onSubmit: (values: { nombre: string; descripcion?: string }) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: { nombre: '', descripcion: '' },
  });

  return (
    <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm max-w-2xl">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
        <div className="w-12 h-12 bg-[#006847]/10 text-[#006847] rounded-2xl flex items-center justify-center shrink-0">
          <Store className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-foreground">Crea tu tienda</h2>
          <p className="text-sm text-muted-foreground">
            Es el último paso antes de publicar productos.
          </p>
        </div>
      </div>

      <form
        className="space-y-5"
        noValidate
        onSubmit={handleSubmit((values) =>
          onSubmit({
            nombre: values.nombre,
            ...(values.descripcion ? { descripcion: values.descripcion } : {}),
          }),
        )}
      >
        <div>
          <label htmlFor="nombre" className="block text-xs font-bold text-foreground mb-2">
            Nombre de la tienda <span className="text-destructive">*</span>
          </label>
          <input
            id="nombre"
            {...register('nombre')}
            placeholder="Ej. Moda Urbana MX"
            className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all"
          />
          {errors.nombre && (
            <p className="text-xs font-semibold text-destructive mt-1.5">
              {errors.nombre.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="descripcion"
            className="block text-xs font-bold text-foreground mb-2"
          >
            Descripción{' '}
            <span className="text-muted-foreground font-normal">(opcional)</span>
          </label>
          <textarea
            id="descripcion"
            rows={3}
            {...register('descripcion')}
            placeholder="¿Qué vendes y por qué deberían comprarte?"
            className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"
          />
          {errors.descripcion && (
            <p className="text-xs font-semibold text-destructive mt-1.5">
              {errors.descripcion.message}
            </p>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <button
            type="submit"
            disabled={isPending}
            className="bg-[#006847] text-white px-8 h-12 rounded-xl font-bold hover:bg-[#005439] transition-colors shadow-lg shadow-[#006847]/25 inline-flex items-center gap-2 disabled:opacity-50"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Crear tienda
          </button>
        </div>
      </form>
    </div>
  );
}
