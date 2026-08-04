import { CheckCircle, MapPin, Package } from 'lucide-react';
import { Link } from 'react-router';

import { ROUTES } from '@/constants/routes';
import type { OrderDetailDto } from '@/types/order';
import { formatMoney } from '@/utils/format';

/**
 * Confirmación de compra.
 *
 * Recupera la pantalla del paso 4 del diseño de Figma, pero con datos reales:
 * el número de pedido, el total y el estado salen de `GET /orders/:id` una vez
 * que el webhook lo dejó en `PAGADO`.
 *
 * Del diseño original se quitó el bloque "Detalles de entrega", que prometía
 * "CorreosClic Express — llega mañana antes de las 21:00": Orders no devuelve
 * transportista ni fecha estimada, y Logistics todavía no está integrado. En su
 * lugar se muestra la dirección real y un aviso honesto sobre el seguimiento.
 */
export function PaymentSuccess({ order }: { order: OrderDetailDto }) {
  const direccion = order.direccionEntrega;

  return (
    <div className="bg-[#F5F6F8] min-h-[80vh] flex flex-col items-center justify-center py-20 px-4">
      <div className="w-24 h-24 bg-[#006847]/10 rounded-full flex items-center justify-center mb-6 relative">
        <div className="absolute inset-0 bg-[#006847] rounded-full animate-ping opacity-20" />
        <CheckCircle className="w-12 h-12 text-[#006847]" />
      </div>

      <h1 className="text-3xl font-black text-foreground mb-3 text-center">
        ¡Gracias por tu compra!
      </h1>

      <p className="text-muted-foreground text-center max-w-md mb-2">
        Tu pedido <span className="font-bold text-foreground">{order.orderNumber}</span> quedó
        confirmado.
      </p>

      <p className="text-2xl font-black text-foreground mb-8">
        {formatMoney(order.resumenFinanciero.total, { cents: true })}
      </p>

      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm w-full max-w-md mb-8">
        <h2 className="font-bold text-foreground mb-4 border-b border-border pb-3">
          Datos de tu pedido
        </h2>

        <div className="flex items-start gap-3 mb-4">
          <Package className="w-5 h-5 text-[#006847] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Pago confirmado</p>
            <p className="text-xs text-muted-foreground">
              {order.vendedores.length === 1
                ? 'Tu pedido pasó a preparación.'
                : `Los ${order.vendedores.length} vendedores comenzarán a preparar tu pedido.`}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            {direccion.alias && (
              <p className="text-sm font-semibold text-foreground">{direccion.alias}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {direccion.direccionFormateada ??
                `${direccion.calle} ${direccion.numeroExterior}, ${direccion.ciudad}`}
            </p>
          </div>
        </div>
      </div>

      {/* TODO: Módulo 7 — el seguimiento se habilita cuando Logistics esté
          integrado (GET /logistics/orders/:pedidoId/shipments). No se muestra
          transportista ni fecha estimada porque el backend no los da todavía. */}
      <p className="text-xs text-muted-foreground text-center max-w-md mb-6">
        En cuanto tu pedido se despache podrás seguirlo desde el detalle.
      </p>

      <div className="flex gap-4 flex-wrap justify-center">
        <Link
          to={ROUTES.home}
          className="bg-white text-primary border-2 border-primary/20 px-8 h-12 rounded-xl font-bold hover:bg-primary/5 transition-colors flex items-center"
        >
          Volver al inicio
        </Link>

        <Link
          to={`${ROUTES.orders}/${order.orderId}`}
          className="bg-[#006847] text-white px-8 h-12 rounded-xl font-bold hover:bg-[#005439] transition-colors shadow-lg shadow-[#006847]/25 flex items-center gap-2"
        >
          <Package className="w-4 h-4" /> Ver pedido
        </Link>
      </div>
    </div>
  );
}
