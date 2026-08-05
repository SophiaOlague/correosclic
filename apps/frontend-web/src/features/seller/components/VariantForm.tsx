import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { ErrorState } from '@/components/common/EmptyState';

import { useAttributeValues, useAttributes } from '../hooks/useSellerProducts';
import { variantSchema, type VariantFormValues } from '../schemas/seller.schemas';

/**
 * Alta de una variante con su inventario.
 *
 * `CreateProductVariantDto` exige `@ArrayMinSize(1)` en `valorAtributoIds`: no
 * hay variantes "sin atributos", ni siquiera para un producto de presentación
 * única. Por eso el selector de atributo es obligatorio y no un extra.
 *
 * Precio y stock viven aquí y no en el producto, que es como los modela Prisma.
 */
export function VariantForm({
  isPending,
  onCancel,
  onSubmit,
}: {
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (values: VariantFormValues) => void;
}) {
  const [attributeId, setAttributeId] = useState('');

  const attributes = useAttributes();
  const values = useAttributeValues(attributeId || undefined);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VariantFormValues>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      sku: '',
      precio: 0,
      valorAtributoIds: [],
      stockDisponible: 0,
      stockMinimo: 0,
    },
  });

  const seleccionados = watch('valorAtributoIds');

  const alternarValor = (valorId: string) => {
    setValue(
      'valorAtributoIds',
      seleccionados.includes(valorId)
        ? seleccionados.filter((id) => id !== valorId)
        : [...seleccionados, valorId],
      { shouldValidate: true },
    );
  };

  return (
    <form
      className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-5"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-foreground">Nueva variante</h3>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cerrar"
          className="p-2 text-muted-foreground bg-[#F5F6F8] rounded-full hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="sku" className="block text-xs font-bold text-foreground mb-2">
            SKU <span className="text-destructive">*</span>
          </label>
          <input
            id="sku"
            {...register('sku')}
            placeholder="Ej. AUD-BT-NEGRO"
            className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all uppercase"
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            Debe ser único en todo el marketplace.
          </p>
          {errors.sku && (
            <p className="text-xs font-semibold text-destructive mt-1.5">
              {errors.sku.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="precio" className="block text-xs font-bold text-foreground mb-2">
            Precio (MXN) <span className="text-destructive">*</span>
          </label>
          <input
            id="precio"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            {...register('precio')}
            placeholder="0.00"
            className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all"
          />
          {errors.precio && (
            <p className="text-xs font-semibold text-destructive mt-1.5">
              {errors.precio.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="stockDisponible"
            className="block text-xs font-bold text-foreground mb-2"
          >
            Stock disponible <span className="text-destructive">*</span>
          </label>
          <input
            id="stockDisponible"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            {...register('stockDisponible')}
            className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all"
          />
          {errors.stockDisponible && (
            <p className="text-xs font-semibold text-destructive mt-1.5">
              {errors.stockDisponible.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="stockMinimo"
            className="block text-xs font-bold text-foreground mb-2"
          >
            Stock mínimo <span className="text-destructive">*</span>
          </label>
          <input
            id="stockMinimo"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            {...register('stockMinimo')}
            className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all"
          />
          {errors.stockMinimo && (
            <p className="text-xs font-semibold text-destructive mt-1.5">
              {errors.stockMinimo.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <span className="block text-xs font-bold text-foreground mb-2">
          Atributos que distinguen esta variante <span className="text-destructive">*</span>
        </span>

        {attributes.isError ? (
          <ErrorState
            title="No pudimos cargar los atributos"
            onRetry={() => attributes.refetch()}
          />
        ) : (
          <div className="space-y-3">
            <select
              value={attributeId}
              onChange={(event) => setAttributeId(event.target.value)}
              disabled={attributes.isLoading}
              aria-label="Atributo"
              className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all cursor-pointer disabled:opacity-50"
            >
              <option value="">
                {attributes.isLoading ? 'Cargando...' : 'Selecciona un atributo'}
              </option>
              {attributes.data?.map((atributo) => (
                <option key={atributo.id} value={atributo.id}>
                  {atributo.nombre}
                </option>
              ))}
            </select>

            {attributeId && (
              <div className="flex flex-wrap gap-2">
                {values.isLoading && (
                  <span className="text-xs text-muted-foreground">Cargando valores...</span>
                )}

                {values.data?.length === 0 && (
                  <span className="text-xs text-muted-foreground">
                    Este atributo todavía no tiene valores.
                  </span>
                )}

                {values.data?.map((valor) => {
                  const activo = seleccionados.includes(valor.id);

                  return (
                    <button
                      key={valor.id}
                      type="button"
                      onClick={() => alternarValor(valor.id)}
                      aria-pressed={activo}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                        activo
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-foreground border-border hover:border-primary/40'
                      }`}
                    >
                      {valor.valor}
                    </button>
                  );
                })}
              </div>
            )}

            {seleccionados.length > 0 && (
              <p className="text-xs font-semibold text-[#006847]">
                {seleccionados.length}{' '}
                {seleccionados.length === 1 ? 'valor seleccionado' : 'valores seleccionados'}
              </p>
            )}
          </div>
        )}

        {errors.valorAtributoIds && (
          <p className="text-xs font-semibold text-destructive mt-1.5">
            {errors.valorAtributoIds.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-semibold text-muted-foreground hover:text-foreground px-4 h-11"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="bg-[#006847] text-white px-6 h-11 rounded-xl text-sm font-bold hover:bg-[#005439] transition-colors shadow-sm inline-flex items-center gap-2 disabled:opacity-50"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Agregar variante
        </button>
      </div>
    </form>
  );
}
