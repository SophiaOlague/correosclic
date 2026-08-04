import type { ReactNode } from 'react';

import type { BranchQueueItemDto } from '@/types/logistics';

import { formatTrackingDate } from '../lib/shipment-states';
import { ShipmentStateBadge } from './ShipmentStateBadge';

/**
 * Tabla de una cola de sucursal.
 *
 * `reception-queue` y `dispatch-queue` devuelven el registro `Envio` crudo, sin
 * DTO: no traen número de pedido, ni cliente, ni vendedor. Las columnas son
 * exactamente lo que hay — el diseño de Figma mostraba también "Pedido" y
 * "Vendedor", que aquí se omiten en vez de rellenarse con datos inventados.
 */
export function BranchQueueTable({
  envios,
  emptyMessage,
  renderAction,
}: {
  envios: BranchQueueItemDto[];
  emptyMessage: string;
  renderAction: (envio: BranchQueueItemDto) => ReactNode;
}) {
  if (envios.length === 0) {
    return (
      <div className="px-5 py-12 text-center">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left min-w-[540px]">
        <thead className="bg-[#F5F6F8]/50 text-xs text-muted-foreground uppercase border-b border-border">
          <tr>
            <th className="px-5 py-4 font-semibold">Guía CorreosClic</th>
            <th className="px-5 py-4 font-semibold">Estado</th>
            <th className="px-5 py-4 font-semibold">Guía generada</th>
            <th className="px-5 py-4 font-semibold text-right">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {envios.map((envio) => (
            <tr key={envio.id} className="hover:bg-[#F5F6F8]/80 transition-colors">
              <td className="px-5 py-4 font-black text-foreground font-mono">
                {envio.trackingInterno}
              </td>
              <td className="px-5 py-4">
                <ShipmentStateBadge estado={envio.estado} size="sm" />
              </td>
              <td className="px-5 py-4 font-medium text-muted-foreground whitespace-nowrap">
                {formatTrackingDate(envio.createdAt)}
              </td>
              <td className="px-5 py-4 text-right">{renderAction(envio)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
