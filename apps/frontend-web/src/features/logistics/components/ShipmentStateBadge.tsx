import { shipmentStateVisual } from '../lib/shipment-states';

/**
 * Etiqueta de `EstadoEnvio`. Misma forma que `OrderStateBadge` para que un
 * pedido y sus envíos se lean como parte del mismo sistema.
 */
export function ShipmentStateBadge({
  estado,
  size = 'md',
}: {
  estado: string;
  size?: 'sm' | 'md';
}) {
  const { label, icon: Icon, className } = shipmentStateVisual(estado);

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
