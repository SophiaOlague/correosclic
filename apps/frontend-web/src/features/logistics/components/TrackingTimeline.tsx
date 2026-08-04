import { History } from 'lucide-react';

import type { TrackingEventDto } from '@/types/logistics';

import { formatTrackingDate, shipmentStateVisual } from '../lib/shipment-states';

/**
 * Historial de movimientos. Conserva la línea de tiempo vertical del diseño de
 * Figma, con dos diferencias que impone el contrato real:
 *
 * 1. **Se renderiza el orden recibido y nada más.** El export dibujaba siete
 *    pasos fijos y marcaba cuál era "el actual"; aquí cada punto es un
 *    `EventoTracking` que el backend escribió de verdad. No hay pasos futuros
 *    atenuados: inventarlos sería prometer etapas que quizá no ocurran (un
 *    envío sin transferencia nunca pasa por `EN_TRANSITO`).
 * 2. El último evento es el estado actual, así que es el que se resalta.
 */
export function TrackingTimeline({ eventos }: { eventos: TrackingEventDto[] }) {
  if (eventos.length === 0) {
    return (
      <div className="flex flex-col items-center text-center py-10">
        <div className="w-12 h-12 rounded-2xl bg-[#F5F6F8] flex items-center justify-center mb-4">
          <History className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-bold text-foreground mb-1">Todavía no hay movimientos</p>
        <p className="text-sm text-muted-foreground max-w-sm">
          En cuanto el paquete registre su primer movimiento aparecerá aquí.
        </p>
      </div>
    );
  }

  const ultimoIndice = eventos.length - 1;

  return (
    <ol className="relative pl-2 sm:pl-4">
      {/* Riel: llega hasta el último punto, no más allá. */}
      <div className="absolute top-3 bottom-8 left-[26px] sm:left-[34px] w-0.5 bg-[#006847]/20 rounded-full" />

      <div className="space-y-7">
        {eventos.map((evento, index) => {
          const { label, icon: Icon } = shipmentStateVisual(evento.estado);
          const esActual = index === ultimoIndice;

          return (
            <li key={`${evento.estado}-${evento.createdAt}-${index}`} className="relative flex items-start gap-5">
              <div className="relative z-10 shrink-0 mt-0.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${
                    esActual
                      ? 'bg-white border-[#006847] text-[#006847] shadow-lg shadow-[#006847]/20'
                      : 'bg-[#006847] border-[#006847] text-white'
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                {esActual && (
                  <div className="absolute inset-0 border-2 border-[#006847] rounded-full animate-ping opacity-20" />
                )}
              </div>

              <div className="flex-1 pt-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                  <h3
                    className={`text-sm font-bold ${esActual ? 'text-[#006847]' : 'text-foreground'}`}
                  >
                    {label}
                  </h3>
                  <time
                    dateTime={evento.createdAt}
                    className="text-xs font-semibold text-muted-foreground whitespace-nowrap bg-[#F5F6F8] px-2 py-0.5 rounded-md w-fit"
                  >
                    {formatTrackingDate(evento.createdAt)}
                  </time>
                </div>

                {/* La descripción la redacta el backend: se muestra literal. */}
                <p className="text-sm text-muted-foreground break-words">{evento.descripcion}</p>
              </div>
            </li>
          );
        })}
      </div>
    </ol>
  );
}
