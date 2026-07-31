import { ArrowLeft, ChevronRight, MapPin, Package } from 'lucide-react';
import { Link, useParams } from 'react-router';

import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { ROUTES } from '@/constants/routes';
import { ApiError } from '@/services/http';
import { formatMoney } from '@/utils/format';

import { OrderStateBadge } from '../components/OrderStateBadge';
import { OrderVendorGroup } from '../components/OrderVendorGroup';
import { formatOrderDate } from '../components/OrderCard';
import { useOrder } from '../hooks/useOrders';

/**
 * Detalle del pedido — `GET /orders/:id`.
 *
 * El endpoint acota por cliente: si el pedido es de otra persona responde 404,
 * así que aquí no hace falta ninguna comprobación de propiedad adicional.
 *
 * Todo lo que se muestra sale de la respuesta. No se añade información de pago
 * ni de logística: Orders no la devuelve, y son los módulos 6 y 7.
 */
export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError, error, refetch } = useOrder(id);

  if (isLoading) return <OrderDetailSkeleton />;

  if (isError) {
    const notFound = error instanceof ApiError && error.isNotFound;

    return (
      <main className="bg-[#F5F6F8] min-h-[60vh] py-16">
        <div className="max-w-2xl mx-auto px-4">
          {notFound ? (
            <EmptyState
              icon={Package}
              title="No encontramos este pedido"
              description="Puede que el enlace sea incorrecto o que el pedido no esté asociado a tu cuenta."
              action={
                <Link
                  to={ROUTES.orders}
                  className="bg-primary text-white px-6 h-11 inline-flex items-center rounded-xl text-sm font-bold hover:bg-[#C4006A] transition-colors shadow-sm shadow-primary/20"
                >
                  Ver mis pedidos
                </Link>
              }
            />
          ) : (
            <ErrorState onRetry={() => refetch()} />
          )}
        </div>
      </main>
    );
  }

  if (!order) return null;

  const { direccionEntrega: direccion, resumenFinanciero: resumen } = order;

  return (
    <main className="bg-[#F5F6F8] min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        <nav aria-label="Ruta" className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link to={ROUTES.home} className="hover:text-foreground">
            Inicio
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={ROUTES.orders} className="hover:text-foreground">
            Mis pedidos
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-semibold">{order.orderNumber}</span>
        </nav>

        <Link
          to={ROUTES.orders}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver a mis pedidos
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-foreground">
              Pedido {order.orderNumber}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Realizado el {formatOrderDate(order.fecha)}
              {order.fechaPago && <> · Pagado el {formatOrderDate(order.fechaPago)}</>}
            </p>
          </div>
          <OrderStateBadge estado={order.estado} />
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 w-full space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">
                {order.vendedores.length > 1
                  ? `${order.vendedores.length} vendedores en este pedido`
                  : 'Productos'}
              </h2>

              {order.vendedores.length > 1 && (
                <p className="text-sm text-muted-foreground mb-4">
                  Cada vendedor prepara y envía su parte por separado, así que sus estados pueden
                  avanzar a ritmos distintos.
                </p>
              )}

              <div className="space-y-4">
                {order.vendedores.map((vendedor) => (
                  <OrderVendorGroup key={vendedor.vendedorId} vendedor={vendedor} />
                ))}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[380px] shrink-0 space-y-4">
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-black text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Dirección de entrega
              </h2>

              {direccion.alias && (
                <p className="text-sm font-bold text-foreground mb-1">{direccion.alias}</p>
              )}

              <address className="text-sm text-muted-foreground not-italic leading-relaxed">
                {direccion.direccionFormateada ?? (
                  <>
                    {direccion.calle} {direccion.numeroExterior}
                    {direccion.numeroInterior && ` Int. ${direccion.numeroInterior}`}
                    {direccion.colonia && <>, {direccion.colonia}</>}
                    <br />
                    {direccion.ciudad}, {direccion.estadoProvincia}
                    <br />
                    C.P. {direccion.codigoPostal}
                  </>
                )}
              </address>
            </div>

            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm sticky top-[136px]">
              <h2 className="text-lg font-black text-foreground mb-5">Resumen</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-border text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">
                    {formatMoney(resumen.subtotal, { cents: true })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="font-medium text-foreground">
                    {formatMoney(resumen.costoEnvio, { cents: true })}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <span className="text-base font-bold text-foreground">Total</span>
                <span className="text-2xl font-black text-foreground leading-none">
                  {formatMoney(resumen.total, { cents: true })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function OrderDetailSkeleton() {
  return (
    <main className="bg-[#F5F6F8] min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="h-4 w-64 bg-white rounded animate-pulse mb-6" />
        <div className="h-9 w-80 bg-white rounded animate-pulse mb-8" />
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 w-full space-y-4">
            <div className="h-72 bg-white rounded-2xl border border-border animate-pulse" />
          </div>
          <div className="w-full lg:w-[380px] shrink-0 space-y-4">
            <div className="h-40 bg-white rounded-2xl border border-border animate-pulse" />
            <div className="h-56 bg-white rounded-2xl border border-border animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}
