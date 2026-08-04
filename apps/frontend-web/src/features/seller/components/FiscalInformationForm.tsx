import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import type { SellerFiscalInformationDto } from '@/types/seller';

import {
  fiscalInformationSchema,
  type FiscalInformationFormValues,
} from '../schemas/seller.schemas';

/**
 * Régimenes fiscales del SAT.
 *
 * El backend acepta `regimenFiscal` como texto libre (max 255), así que la
 * lista es una ayuda de captura, no un contrato: si el SAT publica uno nuevo,
 * basta con añadirlo aquí sin tocar el servidor.
 */
const REGIMENES_FISCALES = [
  '601 - General de Ley Personas Morales',
  '603 - Personas Morales con Fines no Lucrativos',
  '605 - Sueldos y Salarios e Ingresos Asimilados a Salarios',
  '606 - Arrendamiento',
  '612 - Personas Físicas con Actividades Empresariales y Profesionales',
  '614 - Ingresos por Intereses',
  '616 - Sin obligaciones fiscales',
  '621 - Incorporación Fiscal',
  '626 - Régimen Simplificado de Confianza',
];

export function FiscalInformationForm({
  registrada,
  isPending,
  onSubmit,
}: {
  /** Si ya está registrada, el backend responde 409 a un segundo intento. */
  registrada: SellerFiscalInformationDto | null;
  isPending: boolean;
  onSubmit: (values: FiscalInformationFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FiscalInformationFormValues>({
    resolver: zodResolver(fiscalInformationSchema),
    defaultValues: {
      rfc: registrada?.rfc ?? '',
      razonSocial: registrada?.razonSocial ?? '',
      regimenFiscal: registrada?.regimenFiscal ?? '',
    },
  });

  if (registrada) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Tu información fiscal ya quedó registrada. No puede modificarse una vez guardada.
        </p>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F5F6F8] rounded-xl p-5">
          <div>
            <dt className="text-xs text-muted-foreground mb-0.5">RFC</dt>
            <dd className="text-sm font-bold text-foreground font-mono">{registrada.rfc}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground mb-0.5">Razón social</dt>
            <dd className="text-sm font-bold text-foreground">{registrada.razonSocial}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground mb-0.5">Régimen fiscal</dt>
            <dd className="text-sm font-bold text-foreground">{registrada.regimenFiscal}</dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="rfc" className="block text-xs font-bold text-foreground mb-2">
          RFC <span className="text-destructive">*</span>
        </label>
        <input
          id="rfc"
          {...register('rfc')}
          placeholder="GODE561231GR8"
          autoComplete="off"
          className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all uppercase"
        />
        {errors.rfc && (
          <p className="text-xs font-semibold text-destructive mt-1.5">{errors.rfc.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="razonSocial" className="block text-xs font-bold text-foreground mb-2">
          Razón social o nombre completo <span className="text-destructive">*</span>
        </label>
        <input
          id="razonSocial"
          {...register('razonSocial')}
          placeholder="Ej. Comercializadora del Norte S.A. de C.V."
          className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all"
        />
        {errors.razonSocial && (
          <p className="text-xs font-semibold text-destructive mt-1.5">
            {errors.razonSocial.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="regimenFiscal"
          className="block text-xs font-bold text-foreground mb-2"
        >
          Régimen fiscal <span className="text-destructive">*</span>
        </label>
        <select
          id="regimenFiscal"
          {...register('regimenFiscal')}
          defaultValue=""
          className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all cursor-pointer"
        >
          <option value="" disabled>
            Selecciona tu régimen
          </option>
          {REGIMENES_FISCALES.map((regimen) => (
            <option key={regimen} value={regimen}>
              {regimen}
            </option>
          ))}
        </select>
        {errors.regimenFiscal && (
          <p className="text-xs font-semibold text-destructive mt-1.5">
            {errors.regimenFiscal.message}
          </p>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary text-white px-8 h-12 rounded-xl font-bold hover:bg-[#C4006A] transition-colors shadow-lg shadow-primary/25 inline-flex items-center gap-2 disabled:opacity-50"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Guardar y continuar
        </button>
      </div>
    </form>
  );
}
