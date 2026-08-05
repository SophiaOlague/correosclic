import { Package, Store, Truck } from 'lucide-react';

import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import type { VendorGroup } from '@/types/checkout';
import { formatMoney } from '@/utils/format';

/**
 * Un envío por vendedor: sus productos y la cotización que devolvió el backend.
 *
 * El desglose distingue la **tarifa** que le correspondería al vendedor por
 * separado del **importe realmente aplicado**, porque en un pedido
 * multivendedor solo la tarifa más alta se cobra completa y el resto aporta
 * una fracción. Mostrar únicamente `tarifa` haría que las cifras no cuadraran
 * con el envío total.
 */
export function VendorShipmentGroup({ group }: { group: VendorGroup }) {
  const { envio } = group;

  // Ningún importe se calcula aquí: se suman los subtotales que ya vienen
  // redondeados por el backend, solo para encabezar el grupo.
  const subtotalVendedor = group.items.reduce((total, item) => total + item.subtotal, 0);

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-[#F5F6F8]/60">
        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Store className="w-4.5 h-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-foreground truncate">{group.nombreTienda}</p>
          <p className="text-xs text-muted-foreground">
            {group.items.length} {group.items.length === 1 ? 'producto' : 'productos'} ·{' '}
            {formatMoney(subtotalVendedor, { cents: true })}
          </p>
        </div>
      </div>

      <div className="px-6 py-4 space-y-4">
        {group.items.map((item) => (
          <div key={item.productoVarianteId} className="flex gap-3">
            <div className="relative w-16 h-16 bg-[#F5F6F8] rounded-lg overflow-hidden shrink-0 border border-border">
              {item.imagen && (
                <ImageWithFallback
                  src={item.imagen}
                  alt={item.nombre}
                  className="w-full h-full object-cover"
                />
              )}
              <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {item.cantidad}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                {item.nombre}
              </p>
              {item.atributos.length > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.atributos.join(' · ')}
                </p>
              )}
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

      {envio && (
        <div className="px-6 py-4 border-t border-border bg-[#006847]/[0.03]">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-[#006847] shrink-0 mt-0.5" />

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <p className="text-sm font-bold text-foreground">Envío de este vendedor</p>
                <p className="text-sm font-black text-foreground">
                  {formatMoney(envio.esTarifaBase ? envio.tarifa : (envio.recargoAplicado ?? 0), {
                    cents: true,
                  })}
                </p>
              </div>

              <p className="text-xs text-muted-foreground mt-1">
                {envio.esTarifaBase ? (
                  <>Tarifa base del pedido: se cobra completa.</>
                ) : (
                  <>
                    Tarifa individual {formatMoney(envio.tarifa, { cents: true })}; al ir junto con
                    otro vendedor solo se aplica una parte.
                  </>
                )}
              </p>

              {/* Datos logísticos reales que devuelve el backend. */}
              <div className="flex items-center gap-3 flex-wrap mt-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" />
                  {envio.pesoKg} kg
                </span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>{envio.distanciaKm} km</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>Zona {envio.zonaTarifariaCodigo}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
