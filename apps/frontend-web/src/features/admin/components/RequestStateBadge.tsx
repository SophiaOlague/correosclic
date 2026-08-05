import { CheckCircle2, Clock, XCircle, type LucideIcon } from 'lucide-react';

/** Valores de `EstadoSolicitudVendedor`. */
const VISUALS: Record<string, { label: string; className: string; icon: LucideIcon }> = {
  PENDIENTE: {
    label: 'Pendiente de revisión',
    className: 'bg-amber-100 text-amber-800',
    icon: Clock,
  },
  APROBADA: {
    label: 'Aprobada',
    className: 'bg-[#006847]/10 text-[#006847]',
    icon: CheckCircle2,
  },
  RECHAZADA: {
    label: 'Rechazada',
    className: 'bg-destructive/10 text-destructive',
    icon: XCircle,
  },
};

export function RequestStateBadge({ estado }: { estado: string }) {
  const visual = VISUALS[estado];

  if (!visual) {
    // Un estado que el frontend no conoce se muestra tal cual en vez de
    // ocultarse: el backend es la autoridad sobre el enum.
    return (
      <span className="inline-flex items-center bg-[#F5F6F8] text-muted-foreground text-xs font-bold px-3 py-1.5 rounded-lg">
        {estado}
      </span>
    );
  }

  const Icon = visual.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg ${visual.className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {visual.label}
    </span>
  );
}
