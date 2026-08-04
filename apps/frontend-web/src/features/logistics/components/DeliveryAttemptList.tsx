import type { DeliveryAttemptDto } from '@/types/logistics';

import { attemptResultVisual, formatTrackingDate } from '../lib/shipment-states';

/**
 * Historial de intentos de entrega (`IntentoEntrega`).
 *
 * Se renderiza en el orden que devuelve el backend, que los ordena por
 * `numeroIntento` ascendente. No se deduce nada: si un intento no dejó
 * observaciones, la fila no muestra nada en su lugar.
 */
export function DeliveryAttemptList({ intentos }: { intentos: DeliveryAttemptDto[] }) {
  if (intentos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Todavía no se ha registrado ningún intento de entrega.
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {intentos.map((intento) => {
        const { label, icon: Icon, className } = attemptResultVisual(intento.resultado);

        return (
          <li
            key={intento.id}
            className="flex items-start gap-4 p-4 rounded-xl border border-border bg-[#F5F6F8]/40"
          >
            <div
              className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 ${className}`}
            >
              <Icon className="w-[18px] h-[18px]" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <p className="text-sm font-bold text-foreground">
                  Intento {intento.numeroIntento} · {label}
                </p>
                <time
                  dateTime={intento.createdAt}
                  className="text-xs font-semibold text-muted-foreground whitespace-nowrap"
                >
                  {formatTrackingDate(intento.createdAt)}
                </time>
              </div>

              {intento.observaciones && (
                <p className="text-sm text-muted-foreground mt-1 break-words">
                  {intento.observaciones}
                </p>
              )}

              {intento.fotoIntentoUrl && (
                <a
                  href={intento.fotoIntentoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-primary hover:underline mt-1 inline-block"
                >
                  Ver evidencia
                </a>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
