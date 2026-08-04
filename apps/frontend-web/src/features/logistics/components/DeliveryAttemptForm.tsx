import { CheckSquare, Loader2, X } from 'lucide-react';
import { useState } from 'react';

import type { DeliveryAttemptResult, RecordDeliveryAttemptRequest } from '@/types/logistics';

/**
 * Registro de un intento de entrega.
 *
 * Los cuatro resultados son los literales de `ResultadoIntentoEntrega`. El
 * repartidor informa **qué pasó**; no elige el estado del envío. Con un
 * resultado fallido es `DeliveryRetryPolicy` quien decide, comparando contra
 * `MAX_DELIVERY_ATTEMPTS`, si toca reintentar o devolver al remitente — por eso
 * el formulario no anuncia ninguna de las dos cosas.
 */
const RESULTADOS: {
  value: DeliveryAttemptResult;
  titulo: string;
  detalle: string;
}[] = [
  {
    value: 'DESTINATARIO_AUSENTE',
    titulo: 'Destinatario ausente',
    detalle: 'No había nadie que pudiera recibir el paquete.',
  },
  {
    value: 'DIRECCION_INCORRECTA',
    titulo: 'Dirección incorrecta',
    detalle: 'El domicilio no corresponde o no fue posible localizarlo.',
  },
  {
    value: 'RECHAZADO',
    titulo: 'Rechazado por el destinatario',
    detalle: 'El destinatario se negó a recibir el paquete.',
  },
];

export function DeliveryAttemptForm({
  trackingInterno,
  modo,
  isPending,
  onCancel,
  onSubmit,
}: {
  trackingInterno: string;
  /** `entrega` confirma la entrega; `fallido` registra un intento sin éxito. */
  modo: 'entrega' | 'fallido';
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (body: RecordDeliveryAttemptRequest) => void;
}) {
  const [nombreRecibe, setNombreRecibe] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [resultado, setResultado] = useState<DeliveryAttemptResult>('DESTINATARIO_AUSENTE');

  const esEntrega = modo === 'entrega';

  const enviar = () =>
    onSubmit(
      esEntrega
        ? {
            resultado: 'EXITOSO',
            nombreRecibe: nombreRecibe.trim(),
            observaciones: observaciones.trim() || undefined,
          }
        : {
            resultado,
            observaciones: observaciones.trim() || undefined,
          },
    );

  const puedeEnviar = esEntrega ? nombreRecibe.trim().length > 0 : true;

  return (
    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-black text-foreground">
            {esEntrega ? 'Confirmar entrega' : 'Registrar intento fallido'}
          </h2>
          <p className="text-sm font-mono font-bold text-muted-foreground mt-1">
            {trackingInterno}
          </p>
        </div>

        <button
          onClick={onCancel}
          aria-label="Cerrar"
          className="p-2 text-muted-foreground bg-[#F5F6F8] rounded-full hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {esEntrega ? (
        <div className="mb-8">
          <label htmlFor="nombre-recibe" className="block text-sm font-bold text-foreground mb-2">
            Nombre de quien recibe <span className="text-destructive">*</span>
          </label>
          <input
            id="nombre-recibe"
            type="text"
            value={nombreRecibe}
            onChange={(event) => setNombreRecibe(event.target.value)}
            maxLength={255}
            placeholder="Ej. Roberto Díaz"
            className="w-full bg-[#F5F6F8] border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl px-5 py-4 text-base outline-none transition-all"
          />
        </div>
      ) : (
        <fieldset className="space-y-3 mb-6">
          <legend className="text-sm font-bold text-foreground mb-2">¿Qué ocurrió?</legend>

          {RESULTADOS.map((opcion) => (
            <label
              key={opcion.value}
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                resultado === opcion.value
                  ? 'border-orange-500 bg-orange-50/50'
                  : 'border-border hover:bg-[#F5F6F8]'
              }`}
            >
              <input
                type="radio"
                name="resultado_intento"
                value={opcion.value}
                checked={resultado === opcion.value}
                onChange={() => setResultado(opcion.value)}
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
      )}

      <div className="mb-8">
        <label htmlFor="observaciones-intento" className="block text-sm font-bold text-foreground mb-2">
          Observaciones <span className="text-muted-foreground font-normal">(opcional)</span>
        </label>
        <textarea
          id="observaciones-intento"
          rows={3}
          value={observaciones}
          onChange={(event) => setObservaciones(event.target.value)}
          placeholder="Detalles del intento..."
          className="w-full bg-[#F5F6F8] border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl px-5 py-4 text-sm outline-none transition-all resize-none"
        />
      </div>

      <button
        onClick={enviar}
        disabled={!puedeEnviar || isPending}
        className={`w-full h-14 rounded-2xl font-black text-lg transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          esEntrega
            ? 'bg-[#006847] text-white hover:bg-[#005439] shadow-[#006847]/25'
            : 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-600/25'
        }`}
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          esEntrega && <CheckSquare className="w-5 h-5" />
        )}
        {esEntrega ? 'Finalizar entrega' : 'Guardar intento'}
      </button>
    </div>
  );
}
