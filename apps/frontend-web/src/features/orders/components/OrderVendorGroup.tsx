import { Store } from 'lucide-react';

import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import type { OrderVendorGroupDto } from '@/types/order';
import { formatMoney } from '@/utils/format';

import { OrderStateBadge } from './OrderStateBadge';

/**
 * Un `PedidoVendedor` con sus items.
 *
 * Cada vendedor lleva su propio `estado`, que avanza independiente del estado
 * global del pedido. Los importes son la instantánea que se guardó al crear el
 * pedido; ninguno se recalcula aquí.
 *
 * `comisionMarketplace` no se muestra: es lo que CorreosClic le descuenta al
 * vendedor, no algo que el cliente pague ni que le competa ver en su pedido.
 */
export function OrderVendorGroup({ vendedor }: { vendedor: OrderVendorGroupDto }) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-[#F5F6F8]/60">
        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Store className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-foreground truncate">
            {vendedor.nombreTienda || 'Vendedor'}
          </p>
          <p className="text-xs text-muted-foreground">
            {vendedor.items.length} {vendedor.items.length === 1 ? 'producto' : 'productos'}
          </p>
        </div>

        <OrderStateBadge estado={vendedor.estado} size="sm" />
      </div>

      <div className="px-6 py-4 space-y-4">
        {vendedor.items.map((item) => (
          <div key={item.productoVarianteId} className="flex gap-3">
            <div className="relative w-16 h-16 bg-[#F5F6F8] rounded-lg overflow-hidden shrink-0 border border-border">
              {item.imagenUrl && (
                <ImageWithFallback
                  src={item.imagenUrl}
                  alt={item.nombreProducto}
                  className="w-full h-full object-cover"
                />
              )}
              <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {item.cantidad}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                {item.nombreProducto}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">SKU {item.sku}</p>
            </div>

            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-foreground">
                {formatMoney(item.subtotal, { cents: true })}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatMoney(item.precioUnitario)} c/u
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 py-4 border-t border-border bg-[#F5F6F8]/40 space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium text-foreground">
            {formatMoney(vendedor.subtotal, { cents: true })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Envío asignado</span>
          <span className="font-medium text-foreground">
            {formatMoney(vendedor.costoEnvioAsignado, { cents: true })}
          </span>
        </div>
      </div>
    </div>
  );
}
