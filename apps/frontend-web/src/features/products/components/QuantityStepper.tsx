import { Minus, Plus } from 'lucide-react';

/**
 * Selector de cantidad. Markup del export de Figma; ahora respeta el stock
 * disponible de la variante elegida, que es el mismo límite que aplica
 * `POST /cart/items` en el backend.
 */
export function QuantityStepper({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center bg-[#F5F6F8] rounded-xl border border-transparent p-1 h-14">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        aria-label="Disminuir cantidad"
        className="w-10 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
      >
        <Minus className="w-4 h-4" />
      </button>

      <span aria-live="polite" className="w-8 text-center font-bold text-sm">
        {value}
      </span>

      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Aumentar cantidad"
        className="w-10 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
