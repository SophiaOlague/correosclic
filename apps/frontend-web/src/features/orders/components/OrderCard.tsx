import { ChevronRight, Package, Store } from 'lucide-react';
import { Link } from 'react-router';

import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { ROUTES } from '@/constants/routes';
import type { OrderListItemDto } from '@/types/order';
import { formatMoney } from '@/utils/format';

import { OrderStateBadge } from './OrderStateBadge';

/** Formato "10 de agosto de 2026", con la fecha ISO que devuelve el backend. */
const DATE_FORMAT = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function formatOrderDate(iso: string): string {
  const date = new Date(iso);

  return Number.isNaN(date.getTime()) ? '' : DATE_FORMAT.format(date);
}

/** Tarjeta de la lista "Mis pedidos". */
export function OrderCard({ order }: { order: OrderListItemDto }) {
  return (
    <Link
      to={`${ROUTES.orders}/${order.orderId}`}
      className="bg-white rounded-2xl border border-border p-4 sm:p-6 shadow-sm hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all flex items-center gap-4 group"
    >
      <div className="w-20 h-20 shrink-0 bg-[#F5F6F8] rounded-xl overflow-hidden border border-border">
        {order.miniaturaUrl ? (
          <ImageWithFallback
            src={order.miniaturaUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-7 h-7 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap mb-1.5">
          <p className="text-sm font-black text-foreground">{order.orderNumber}</p>
          <OrderStateBadge estado={order.estado} size="sm" />
        </div>

        <p className="text-xs text-muted-foreground">{formatOrderDate(order.fecha)}</p>

        <div className="flex items-center gap-3 flex-wrap mt-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Package className="w-3.5 h-3.5" />
            {order.cantidadArticulos}{' '}
            {order.cantidadArticulos === 1 ? 'artículo' : 'artículos'}
          </span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span className="inline-flex items-center gap-1">
            <Store className="w-3.5 h-3.5" />
            {order.numeroVendedores}{' '}
            {order.numeroVendedores === 1 ? 'vendedor' : 'vendedores'}
          </span>
        </div>
      </div>

      <div className="text-right shrink-0 flex items-center gap-3">
        <div>
          <p className="text-lg font-black text-foreground">
            {formatMoney(order.total, { cents: true })}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </Link>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 flex items-center gap-4">
      <div className="w-20 h-20 shrink-0 bg-[#F5F6F8] rounded-xl animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-[#F5F6F8] rounded animate-pulse" />
        <div className="h-3 w-40 bg-[#F5F6F8] rounded animate-pulse" />
        <div className="h-3 w-52 bg-[#F5F6F8] rounded animate-pulse" />
      </div>
      <div className="h-6 w-24 bg-[#F5F6F8] rounded animate-pulse" />
    </div>
  );
}
