import {
  AlertOctagon,
  CheckCircle,
  Home,
  PackageCheck,
  PackageX,
  RotateCcw,
  Store,
  Truck,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

/**
 * Presentación de `EstadoEnvio`. Los once literales del enum de Prisma, ni uno
 * más: la interfaz no inventa etapas intermedias ni deduce en cuál va un envío.
 *
 * Los colores salen de la paleta del diseño: verde `#006847` para lo
 * consumado, magenta de marca para lo que está en curso, azul para el
 * transporte y `destructive` para los desenlaces adversos.
 */
interface ShipmentStateVisual {
  label: string;
  /** Qué significa para quien lo lee. Sale del dominio, no de una suposición. */
  description: string;
  icon: LucideIcon;
  className: string;
}

const STATES: Record<string, ShipmentStateVisual> = {
  PENDIENTE_RECEPCION: {
    label: 'Pendiente de recepción',
    description: 'La guía ya se generó y el paquete espera a entrar en la sucursal de origen.',
    icon: PackageCheck,
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  RECIBIDO_SUCURSAL: {
    label: 'Recibido en sucursal',
    description: 'La sucursal de origen certificó la recepción del paquete.',
    icon: Store,
    className: 'bg-accent text-primary border-primary/20',
  },
  CLASIFICADO: {
    label: 'Clasificado',
    description: 'El paquete quedó clasificado para su siguiente etapa.',
    icon: PackageCheck,
    className: 'bg-accent text-primary border-primary/20',
  },
  EN_TRANSITO: {
    label: 'En tránsito',
    description: 'El paquete viaja hacia la sucursal de destino.',
    icon: Truck,
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  EN_SUCURSAL_DESTINO: {
    label: 'En sucursal destino',
    description: 'El paquete llegó a la sucursal de destino.',
    icon: Store,
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  EN_REPARTO: {
    label: 'En reparto',
    description: 'El paquete está asignado a un repartidor.',
    icon: Truck,
    className: 'bg-accent text-primary border-primary/20',
  },
  ENTREGADO: {
    label: 'Entregado',
    description: 'El paquete se entregó al destinatario.',
    icon: Home,
    className: 'bg-[#006847]/10 text-[#006847] border-[#006847]/20',
  },
  DEVUELTO: {
    label: 'Devuelto',
    description: 'El paquete regresó al remitente.',
    icon: RotateCcw,
    className: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  CANCELADO: {
    label: 'Cancelado',
    description: 'El envío se canceló y no entró a la red logística.',
    icon: XCircle,
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  EXTRAVIADO: {
    label: 'Extraviado',
    description: 'El paquete se reportó como extraviado.',
    icon: AlertOctagon,
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  DANADO: {
    label: 'Dañado',
    description: 'El paquete se reportó como dañado.',
    icon: PackageX,
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
};

/** Estado que el frontend no conoce: se muestra el literal del backend tal cual. */
function fallback(estado: string): ShipmentStateVisual {
  return {
    label: estado.replace(/_/g, ' ').toLowerCase(),
    description: '',
    icon: PackageCheck,
    className: 'bg-[#F5F6F8] text-muted-foreground border-border',
  };
}

export function shipmentStateVisual(estado: string): ShipmentStateVisual {
  return STATES[estado] ?? fallback(estado);
}

/** Presentación de `ResultadoIntentoEntrega`. Los cuatro literales del enum. */
interface AttemptResultVisual {
  label: string;
  icon: LucideIcon;
  className: string;
}

const ATTEMPT_RESULTS: Record<string, AttemptResultVisual> = {
  EXITOSO: {
    label: 'Entregado',
    icon: CheckCircle,
    className: 'bg-[#006847]/10 text-[#006847] border-[#006847]/20',
  },
  DESTINATARIO_AUSENTE: {
    label: 'Destinatario ausente',
    icon: Home,
    className: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  DIRECCION_INCORRECTA: {
    label: 'Dirección incorrecta',
    icon: AlertOctagon,
    className: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  RECHAZADO: {
    label: 'Rechazado por el destinatario',
    icon: XCircle,
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
};

export function attemptResultVisual(resultado: string): AttemptResultVisual {
  return (
    ATTEMPT_RESULTS[resultado] ?? {
      label: resultado.replace(/_/g, ' ').toLowerCase(),
      icon: AlertOctagon,
      className: 'bg-[#F5F6F8] text-muted-foreground border-border',
    }
  );
}

/**
 * Fecha y hora de un evento logístico. El backend serializa `Date` a ISO 8601;
 * si llegara algo que `Date` no puede interpretar se devuelve el literal en vez
 * de un "Invalid Date".
 */
export function formatTrackingDate(iso: string): string {
  const fecha = new Date(iso);

  if (Number.isNaN(fecha.getTime())) return iso;

  return fecha.toLocaleString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Variante corta, sin hora, para fechas estimadas. */
export function formatTrackingDay(iso: string): string {
  const fecha = new Date(iso);

  if (Number.isNaN(fecha.getTime())) return iso;

  return fecha.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}
