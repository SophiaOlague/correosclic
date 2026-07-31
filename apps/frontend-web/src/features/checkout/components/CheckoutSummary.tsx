import { Loader2, Lock, ShieldCheck } from 'lucide-react';

import type { CheckoutSummaryDto } from '@/types/checkout';
import { formatMoney } from '@/utils/format';

/**
 * Panel lateral con el resumen financiero.
 *
 * **Todas las cifras vienen tal cual de `GET /checkout`.** No se suma ni se
 * deriva nada: `subtotal`, `shipping`, `total` e `ivaIncluido` son campos de la
 * respuesta.
 *
 * `comisionMarketplace` se omite a propósito: es informativa, corresponde a lo
 * que CorreosClic descuenta a los vendedores y **no la paga el cliente**;
 * mostrarla en el desglose de compra daría a entender lo contrario.
 */
export function CheckoutSummary({
  summary,
  isRecalculating,
}: {
  summary: CheckoutSummaryDto;
  isRecalculating: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm sticky top-[136px]">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-black text-foreground">Resumen de tu pedido</h2>
        {isRecalculating && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
      </div>

      <div className={`transition-opacity ${isRecalculating ? 'opacity-50' : ''}`}>
        <div className="space-y-3 mb-6 pb-6 border-b border-border text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Productos ({summary.itemsCount})
            </span>
            <span className="font-medium text-foreground">
              {formatMoney(summary.subtotal, { cents: true })}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Envío
              {summary.envioDetalle.length > 1 && (
                <span className="text-xs"> ({summary.envioDetalle.length} vendedores)</span>
              )}
            </span>
            <span className="font-medium text-foreground">
              {formatMoney(summary.shipping, { cents: true })}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Peso total</span>
            <span className="font-medium text-foreground">{summary.totalWeightKg} kg</span>
          </div>
        </div>

        <div className="flex justify-between items-end mb-6">
          <span className="text-base font-bold text-foreground">Total</span>
          <div className="text-right">
            <span className="text-2xl font-black text-foreground block leading-none">
              {formatMoney(summary.total, { cents: true })}
            </span>
            <span className="text-xs text-muted-foreground">
              IVA incluido: {formatMoney(summary.ivaIncluido, { cents: true })}
            </span>
          </div>
        </div>
      </div>

      {/* TODO: Módulo 5 — POST /orders. Checkout es solo de lectura. */}
      <button
        type="button"
        disabled
        title="La creación del pedido y el pago llegan en los siguientes módulos"
        className="w-full bg-primary text-white h-14 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Lock className="w-4 h-4" />
        Continuar al pago
      </button>

      <p className="text-xs text-center text-muted-foreground mb-4">
        La confirmación del pedido y el pago se habilitan en el siguiente módulo.
      </p>

      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-[#006847]/5 p-3 rounded-xl border border-[#006847]/10">
        <ShieldCheck className="w-5 h-5 text-[#006847] shrink-0" />
        <p>
          Procesado de forma segura por Stripe.{' '}
          <span className="font-semibold text-foreground">Compra protegida.</span>
        </p>
      </div>
    </div>
  );
}
