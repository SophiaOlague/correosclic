import { PackageSearch, Truck } from 'lucide-react';

import { ErrorState } from '@/components/common/EmptyState';
import type { OrderVendorGroupDto } from '@/types/order';

import { useOrderShipments } from '../hooks/useShipments';
import { ShipmentSummaryCard } from './ShipmentSummaryCard';

/**
 * Bloque de envíos dentro del detalle del pedido.
 *
 * Un pedido tiene **un envío por cada `PedidoVendedor`**, así que aquí se
 * listan todos: nunca se asume que haya uno solo. El nombre de la tienda se
 * cruza contra los vendedores del propio pedido, que ya vienen cargados.
 *
 * Los tres estados posibles se distinguen sin inventar datos:
 * pedido aún sin pagar (no se consulta), pagado pero sin guías todavía, y
 * con guías.
 */
export function OrderShipmentsSection({
  pedidoId,
  estadoPedido,
  vendedores,
}: {
  pedidoId: string;
  estadoPedido: string;
  vendedores: OrderVendorGroupDto[];
}) {
  // Antes de pagar no existe ningún Envio: el fulfillment arranca con el
  // evento que emite Payments al confirmarse el cobro.
  const yaPagado = estadoPedido !== 'PENDIENTE_PAGO' && estadoPedido !== 'CANCELADO';

  const { data: envios, isLoading, isError, refetch } = useOrderShipments(pedidoId, yaPagado);

  if (!yaPagado) return null;

  const nombrePorVendedor = new Map(
    vendedores.map((vendedor) => [vendedor.vendedorId, vendedor.nombreTienda]),
  );

  return (
    <section>
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Truck className="w-5 h-5 text-primary" />
        Seguimiento del envío
        {envios && envios.length > 1 && (
          <span className="text-sm font-semibold text-muted-foreground">
            ({envios.length} envíos)
          </span>
        )}
      </h2>

      {isLoading && (
        <div className="space-y-3">
          <div className="h-[88px] bg-white rounded-2xl border border-border animate-pulse" />
        </div>
      )}

      {isError && (
        <ErrorState
          title="No pudimos cargar el seguimiento"
          description="El pedido se muestra completo; solo falló la consulta de los envíos."
          onRetry={() => refetch()}
        />
      )}

      {envios && envios.length === 0 && (
        <div className="bg-white border border-border rounded-2xl p-6 flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#006847]/10 flex items-center justify-center shrink-0">
            <PackageSearch className="w-5 h-5 text-[#006847]" />
          </div>
          <div>
            <p className="font-bold text-foreground mb-1">Estamos preparando tu envío</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tu pedido ya fue pagado y estamos preparando el envío. En cuanto se genere la
              guía podrás seguirlo desde aquí.
            </p>
          </div>
        </div>
      )}

      {envios && envios.length > 0 && (
        <>
          {envios.length > 1 && (
            <p className="text-sm text-muted-foreground mb-4">
              Cada vendedor genera su propia guía, así que los envíos de este pedido pueden
              avanzar a ritmos distintos.
            </p>
          )}

          <div className="space-y-3">
            {envios.map((envio) => (
              <ShipmentSummaryCard
                key={envio.id}
                envio={envio}
                nombreTienda={
                  envio.vendedorId ? nombrePorVendedor.get(envio.vendedorId) : undefined
                }
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
