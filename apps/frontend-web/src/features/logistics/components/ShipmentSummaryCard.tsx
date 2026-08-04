import { ChevronRight, Package } from 'lucide-react';
import { Link } from 'react-router';

import { ROUTES } from '@/constants/routes';
import type { ShipmentSummaryDto } from '@/types/logistics';

import { formatTrackingDay } from '../lib/shipment-states';
import { ShipmentStateBadge } from './ShipmentStateBadge';

/**
 * Tarjeta de un envío dentro de un pedido.
 *
 * `nombreTienda` no viene de Logistics: el resumen del envío solo trae
 * `vendedorId`, y el nombre se cruza con el `OrderDetailDto` que ya está en
 * pantalla. Si no hay correspondencia, la tarjeta se muestra igual sin el
 * nombre en vez de dejar un hueco.
 */
export function ShipmentSummaryCard({
  envio,
  nombreTienda,
}: {
  envio: ShipmentSummaryDto;
  nombreTienda?: string;
}) {
  return (
    <Link
      to={`${ROUTES.shipment}/${envio.id}`}
      className="bg-white rounded-2xl border border-border p-5 shadow-sm flex items-center gap-4 hover:border-primary/30 transition-colors group"
    >
      <div className="w-11 h-11 rounded-xl bg-[#F5F6F8] flex items-center justify-center shrink-0">
        <Package className="w-5 h-5 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <p className="text-sm font-black text-foreground font-mono">
            {envio.trackingInterno}
          </p>
          <ShipmentStateBadge estado={envio.estado} size="sm" />
        </div>

        {nombreTienda && (
          <p className="text-sm text-muted-foreground truncate">Vendido por {nombreTienda}</p>
        )}

        {envio.fechaEntregaReal ? (
          <p className="text-xs font-semibold text-[#006847] mt-0.5">
            Entregado el {formatTrackingDay(envio.fechaEntregaReal)}
          </p>
        ) : (
          envio.fechaEntregaEstimada && (
            <p className="text-xs font-semibold text-muted-foreground mt-0.5">
              Entrega estimada: {formatTrackingDay(envio.fechaEntregaEstimada)}
            </p>
          )
        )}
      </div>

      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
    </Link>
  );
}
