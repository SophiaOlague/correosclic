import { AlertTriangle, Minus, Plus, Trash2 } from 'lucide-react';

import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import type { CartItemDto } from '@/types/cart';
import { formatMoney } from '@/utils/format';

/**
 * Fila de producto del carrito. Markup del export de Figma, con dos añadidos
 * que el diseño no contemplaba: el aviso cuando la variante deja de estar
 * disponible, y el bloqueo de los controles mientras hay una petición en vuelo.
 */
export function CartItemRow({
  item,
  isBusy,
  onQuantityChange,
  onRemove,
}: {
  item: CartItemDto;
  isBusy: boolean;
  onQuantityChange: (cantidad: number) => void;
  onRemove: () => void;
}) {
  const enMaximo = item.cantidad >= item.stockDisponible;

  return (
    <div
      className={`bg-white rounded-2xl border p-4 sm:p-6 flex flex-col sm:grid sm:grid-cols-12 gap-4 sm:gap-6 items-center shadow-sm transition-opacity ${
        item.disponible ? 'border-border' : 'border-destructive/30'
      } ${isBusy ? 'opacity-60' : ''}`}
    >
      {/* Producto */}
      <div className="col-span-6 flex gap-4 w-full">
        <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 bg-[#F5F6F8] rounded-xl overflow-hidden">
          {item.imagenPrincipalUrl && (
            <ImageWithFallback
              src={item.imagenPrincipalUrl}
              alt={item.nombreProducto}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="flex flex-col justify-between py-1 min-w-0">
          <div>
            <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-snug">
              {item.nombreProducto}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              SKU: <span className="font-semibold text-foreground">{item.sku}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatMoney(item.precioUnitario)} c/u
            </p>

            {!item.disponible && (
              <p className="text-xs text-destructive font-semibold mt-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Sin stock suficiente
              </p>
            )}
          </div>

          {/* Solo móvil: precio y eliminar */}
          <div className="sm:hidden flex items-center justify-between mt-4">
            <span className="font-black text-foreground">{formatMoney(item.subtotal)}</span>
            <button
              onClick={onRemove}
              disabled={isBusy}
              aria-label={`Eliminar ${item.nombreProducto}`}
              className="text-muted-foreground hover:text-destructive transition-colors p-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Cantidad */}
      <div className="col-span-3 flex flex-col items-center gap-1.5 w-full sm:w-auto">
        <div className="flex items-center bg-[#F5F6F8] border border-border rounded-xl h-10 w-full sm:w-auto px-1">
          <button
            onClick={() => onQuantityChange(item.cantidad - 1)}
            disabled={isBusy || item.cantidad <= 1}
            aria-label="Disminuir cantidad"
            className="w-8 h-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <span aria-live="polite" className="w-8 text-center text-sm font-bold">
            {item.cantidad}
          </span>

          <button
            onClick={() => onQuantityChange(item.cantidad + 1)}
            disabled={isBusy || enMaximo}
            aria-label="Aumentar cantidad"
            title={enMaximo ? 'No hay más unidades disponibles' : undefined}
            className="w-8 h-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {enMaximo && (
          <span className="text-[11px] text-muted-foreground">
            Máx. {item.stockDisponible} disponibles
          </span>
        )}
      </div>

      {/* Precio y acciones (escritorio) */}
      <div className="hidden sm:col-span-3 sm:flex flex-col items-end justify-center gap-3 w-full">
        <span className="text-lg font-black text-foreground">{formatMoney(item.subtotal, { cents: true })}</span>
        <button
          onClick={onRemove}
          disabled={isBusy}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" /> Eliminar
        </button>
      </div>
    </div>
  );
}

/** Esqueleto con la misma silueta que la fila. */
export function CartItemRowSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-border p-4 sm:p-6 grid grid-cols-12 gap-6 items-center">
      <div className="col-span-6 flex gap-4">
        <div className="w-28 h-28 shrink-0 bg-[#F5F6F8] rounded-xl animate-pulse" />
        <div className="flex-1 space-y-2 py-2">
          <div className="h-4 w-3/4 bg-[#F5F6F8] rounded animate-pulse" />
          <div className="h-3 w-1/2 bg-[#F5F6F8] rounded animate-pulse" />
        </div>
      </div>
      <div className="col-span-3 flex justify-center">
        <div className="h-10 w-28 bg-[#F5F6F8] rounded-xl animate-pulse" />
      </div>
      <div className="col-span-3 flex justify-end">
        <div className="h-6 w-24 bg-[#F5F6F8] rounded animate-pulse" />
      </div>
    </div>
  );
}
