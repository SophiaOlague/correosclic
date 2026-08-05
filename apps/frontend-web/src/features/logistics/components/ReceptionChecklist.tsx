import { AlertOctagon, Check, ChevronLeft, ClipboardList, CheckSquare, Loader2 } from 'lucide-react';
import { useState } from 'react';

import type { ReceptionResult } from '@/types/logistics';

/**
 * Verificación física de un paquete y certificación del resultado.
 *
 * El checklist es exactamente el del diseño de Figma y **es local**: no se
 * persiste en ningún sitio, porque el backend no lo modela. Sirve para lo
 * mismo que en el diseño —obligar a revisar antes de certificar— y encaja con
 * el contrato real: si todo está conforme, el resultado es `ACEPTADO`; si algo
 * falla, el recepcionista pasa a registrar la incidencia y certifica `DANADO`
 * o `RECHAZADO`.
 *
 * El recepcionista no decide nada más. Ruta, clasificación, vehículo y
 * repartidor los resuelve el motor del backend al aceptarse el paquete.
 */
const VERIFICACIONES = [
  { key: 'sellado', label: 'Empaque correctamente sellado' },
  { key: 'legible', label: 'Etiqueta legible' },
  { key: 'correcta', label: 'Guía correcta' },
  { key: 'sindanos', label: 'Sin daños visibles' },
  { key: 'peso', label: 'Peso verificado' },
  { key: 'dimensiones', label: 'Dimensiones verificadas' },
] as const;

type VerificacionKey = (typeof VERIFICACIONES)[number]['key'];

const SIN_VERIFICAR: Record<VerificacionKey, boolean> = {
  sellado: false,
  legible: false,
  correcta: false,
  sindanos: false,
  peso: false,
  dimensiones: false,
};

export interface ReceptionSubmission {
  resultado: ReceptionResult;
  observaciones?: string;
  pesoRealKg?: number;
}

export function ReceptionChecklist({
  trackingInterno,
  isPending,
  onCancel,
  onSubmit,
}: {
  trackingInterno: string;
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (submission: ReceptionSubmission) => void;
}) {
  const [checks, setChecks] = useState(SIN_VERIFICAR);
  const [peso, setPeso] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [registrandoIncidencia, setRegistrandoIncidencia] = useState(false);
  const [motivo, setMotivo] = useState<'DANADO' | 'RECHAZADO'>('DANADO');

  const todoVerificado = Object.values(checks).every(Boolean);

  const pesoRealKg = peso.trim() === '' ? undefined : Number(peso);
  const pesoInvalido = pesoRealKg !== undefined && (Number.isNaN(pesoRealKg) || pesoRealKg <= 0);

  const alternar = (key: VerificacionKey) =>
    setChecks((previo) => ({ ...previo, [key]: !previo[key] }));

  const aceptar = () =>
    onSubmit({
      resultado: 'ACEPTADO',
      observaciones: observaciones.trim() || undefined,
      pesoRealKg,
    });

  const certificarIncidencia = () =>
    onSubmit({
      resultado: motivo,
      observaciones: observaciones.trim(),
      pesoRealKg,
    });

  if (registrandoIncidencia) {
    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setRegistrandoIncidencia(false)}
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors w-fit"
        >
          <ChevronLeft className="w-4 h-4" /> Volver a la verificación
        </button>

        <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
          <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
            <AlertOctagon className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-foreground mb-2">Registrar incidencia</h2>
          <p className="text-muted-foreground mb-8">
            Estás por cerrar la guía{' '}
            <span className="font-bold text-foreground font-mono">{trackingInterno}</span> sin que
            entre a la red logística. Es una acción definitiva.
          </p>

          <fieldset className="space-y-3 mb-6">
            <legend className="text-xs font-bold text-foreground mb-2">
              ¿Qué ocurrió con el paquete?
            </legend>

            {(
              [
                {
                  value: 'DANADO' as const,
                  titulo: 'Llegó dañado',
                  detalle: 'El paquete queda registrado como dañado y no continúa su trayecto.',
                },
                {
                  value: 'RECHAZADO' as const,
                  titulo: 'No se acepta en sucursal',
                  detalle: 'El envío se cancela: nunca llegó a entrar a la red logística.',
                },
              ] satisfies { value: 'DANADO' | 'RECHAZADO'; titulo: string; detalle: string }[]
            ).map((opcion) => (
              <label
                key={opcion.value}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                  motivo === opcion.value
                    ? 'border-orange-500 bg-orange-50/50'
                    : 'border-border hover:bg-[#F5F6F8]'
                }`}
              >
                <input
                  type="radio"
                  name="motivo_incidencia"
                  value={opcion.value}
                  checked={motivo === opcion.value}
                  onChange={() => setMotivo(opcion.value)}
                  className="w-4 h-4 mt-0.5 accent-orange-600"
                />
                <span>
                  <span className="block text-sm font-bold text-foreground">{opcion.titulo}</span>
                  <span className="block text-xs text-muted-foreground mt-0.5">
                    {opcion.detalle}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>

          <div className="mb-8">
            <label
              htmlFor="observaciones-incidencia"
              className="block text-xs font-bold text-foreground mb-2"
            >
              Motivo <span className="text-destructive">*</span>
            </label>
            <textarea
              id="observaciones-incidencia"
              rows={3}
              value={observaciones}
              onChange={(event) => setObservaciones(event.target.value)}
              maxLength={500}
              placeholder="Describe el estado del paquete..."
              className="w-full bg-[#F5F6F8] border border-transparent focus:border-orange-500 focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Queda registrado en el historial del envío, así que el cliente verá por qué se
              detuvo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setRegistrandoIncidencia(false)}
              className="flex-1 bg-white border-2 border-border text-foreground h-12 rounded-xl font-bold hover:bg-[#F5F6F8] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={certificarIncidencia}
              disabled={isPending || observaciones.trim().length === 0}
              className="flex-1 bg-orange-600 text-white h-12 rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/25 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Guardar incidencia
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={onCancel}
        className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors w-fit"
      >
        <ChevronLeft className="w-4 h-4" /> Volver a la cola
      </button>

      <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b border-border">
          <ClipboardList className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-black text-foreground">Checklist de recepción</h2>
          <span className="text-sm font-black text-foreground font-mono bg-[#F5F6F8] px-3 py-1.5 rounded-lg">
            {trackingInterno}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {VERIFICACIONES.map((verificacion) => (
            <label
              key={verificacion.key}
              className="flex items-center gap-4 p-4 rounded-xl border border-border cursor-pointer hover:bg-[#F5F6F8] transition-colors select-none"
            >
              <input
                type="checkbox"
                checked={checks[verificacion.key]}
                onChange={() => alternar(verificacion.key)}
                className="sr-only"
              />
              <span
                aria-hidden
                className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors shrink-0 ${
                  checks[verificacion.key]
                    ? 'bg-[#006847] border-[#006847] text-white'
                    : 'border-border bg-white'
                }`}
              >
                {checks[verificacion.key] && <Check className="w-5 h-5" />}
              </span>
              <span className="text-sm font-bold text-foreground">{verificacion.label}</span>
            </label>
          ))}
        </div>

        <div className="space-y-4 mb-8">
          <div>
            <label htmlFor="peso-real" className="block text-xs font-bold text-foreground mb-2">
              Peso en báscula{' '}
              <span className="text-muted-foreground font-normal">
                (kg — opcional; si lo capturas, es el peso cobrable)
              </span>
            </label>
            <input
              id="peso-real"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={peso}
              onChange={(event) => setPeso(event.target.value)}
              placeholder="Ej. 1.20"
              className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all"
            />
            {pesoInvalido && (
              <p className="text-xs font-semibold text-destructive mt-1.5">
                El peso debe ser un número mayor que cero.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="observaciones-recepcion"
              className="block text-xs font-bold text-foreground mb-2"
            >
              Observaciones <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <input
              id="observaciones-recepcion"
              type="text"
              value={observaciones}
              onChange={(event) => setObservaciones(event.target.value)}
              maxLength={500}
              placeholder="Añadir notas de la recepción..."
              className="w-full bg-[#F5F6F8] border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
          <button
            onClick={() => setRegistrandoIncidencia(true)}
            disabled={isPending}
            className="flex-1 bg-white text-destructive border-2 border-destructive/20 h-14 rounded-xl font-bold hover:bg-destructive/5 transition-colors flex items-center justify-center gap-2 text-base disabled:opacity-50"
          >
            <AlertOctagon className="w-5 h-5" /> Registrar incidencia
          </button>

          <button
            onClick={aceptar}
            disabled={!todoVerificado || pesoInvalido || isPending}
            className={`flex-1 h-14 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-base shadow-lg ${
              todoVerificado && !pesoInvalido && !isPending
                ? 'bg-[#006847] text-white hover:bg-[#005439] shadow-[#006847]/25'
                : 'bg-[#F5F6F8] text-muted-foreground cursor-not-allowed shadow-none'
            }`}
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckSquare className="w-5 h-5" />
            )}
            Confirmar recepción
          </button>
        </div>

        {!todoVerificado && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            Completa las seis verificaciones para poder confirmar la recepción.
          </p>
        )}
      </div>
    </div>
  );
}
