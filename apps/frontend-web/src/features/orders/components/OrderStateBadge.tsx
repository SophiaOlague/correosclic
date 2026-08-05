import {
  CheckCircle,
  Clock,
  Package,
  RotateCcw,
  Truck,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

/**
 * Etiqueta de estado del pedido.
 *
 * Cubre los valores de `EstadoPedido` y `EstadoPedidoVendedor`, que comparten
 * los mismos siete literales. Los colores salen de la paleta del diseño: verde
 * `#006847` para lo consumado, magenta de marca para lo que está en curso,
 * ámbar para lo que espera al cliente y `destructive` para lo cancelado.
 */
interface StateVisual {
  label: string;
  icon: LucideIcon;
  className: string;
}

const STATES: Record<string, StateVisual> = {
  PENDIENTE_PAGO: {
    label: 'Pendiente de pago',
    icon: Clock,
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  PAGADO: {
    label: 'Pagado',
    icon: CheckCircle,
    className: 'bg-[#006847]/10 text-[#006847] border-[#006847]/20',
  },
  PREPARANDO: {
    label: 'En preparación',
    icon: Package,
    className: 'bg-accent text-primary border-primary/20',
  },
  ENVIADO: {
    label: 'Enviado',
    icon: Truck,
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  ENTREGADO: {
    label: 'Entregado',
    icon: CheckCircle,
    className: 'bg-[#006847]/10 text-[#006847] border-[#006847]/20',
  },
  CANCELADO: {
    label: 'Cancelado',
    icon: XCircle,
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  REEMBOLSADO: {
    label: 'Reembolsado',
    icon: RotateCcw,
    className: 'bg-[#F5F6F8] text-muted-foreground border-border',
  },
};

/** Estado desconocido: se muestra el literal del backend, sin inventar nada. */
function fallback(estado: string): StateVisual {
  return {
    label: estado.replace(/_/g, ' ').toLowerCase(),
    icon: Package,
    className: 'bg-[#F5F6F8] text-muted-foreground border-border',
  };
}

export function OrderStateBadge({
  estado,
  size = 'md',
}: {
  estado: string;
  size?: 'sm' | 'md';
}) {
  const { label, icon: Icon, className } = STATES[estado] ?? fallback(estado);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold whitespace-nowrap ${className} ${
        size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      }`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span className="first-letter:uppercase">{label}</span>
    </span>
  );
}
