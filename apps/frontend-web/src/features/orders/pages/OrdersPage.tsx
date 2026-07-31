import { ChevronRight, Package } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';

import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { ROUTES } from '@/constants/routes';
import { formatNumber } from '@/utils/format';

import { OrderCard, OrderCardSkeleton } from '../components/OrderCard';
import { useOrders } from '../hooks/useOrders';

/** El backend acepta `limit` hasta 100. */
const PAGE_SIZE = 5;

/**
 * Mis pedidos — `GET /orders`.
 *
 * La página vive en la URL para que la paginación sea compartible y el botón
 * "atrás" del navegador funcione. `total` y `totalPages` los manda el backend.
 */
export default function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;

  const { data, isLoading, isError, isFetching, refetch } = useOrders(page, PAGE_SIZE);

  const orders = data?.orders ?? [];

  return (
    <main className="bg-[#F5F6F8] min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        <nav aria-label="Ruta" className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link to={ROUTES.home} className="hover:text-foreground">
            Inicio
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-semibold">Mis pedidos</span>
        </nav>

        <h1 className="text-2xl lg:text-3xl font-black text-foreground mb-8">
          Mis pedidos
          {data && (
            <span className="text-lg font-medium text-muted-foreground ml-2">
              ({formatNumber(data.total)} {data.total === 1 ? 'pedido' : 'pedidos'})
            </span>
          )}
        </h1>

        {isError ? (
          <ErrorState
            title="No pudimos cargar tus pedidos"
            description="Revisa tu conexión e inténtalo de nuevo."
            onRetry={() => refetch()}
          />
        ) : isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <OrderCardSkeleton key={index} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          // Con `total > 0` la lista solo puede venir vacía si la página
          // pedida se salió de rango, p. ej. escribiendo ?page=99 a mano.
          (data?.total ?? 0) > 0 ? (
            <EmptyState
              icon={Package}
              title="Esta página no tiene pedidos"
              description={`Tienes ${formatNumber(data?.total ?? 0)} pedidos repartidos en ${data?.totalPages ?? 1} ${(data?.totalPages ?? 1) === 1 ? 'página' : 'páginas'}.`}
              action={
                <Link
                  to={ROUTES.orders}
                  className="bg-primary text-white px-6 h-11 inline-flex items-center rounded-xl text-sm font-bold hover:bg-[#C4006A] transition-colors shadow-sm shadow-primary/20"
                >
                  Ir a la primera página
                </Link>
              }
            />
          ) : (
            <EmptyState
              icon={Package}
              title="Todavía no tienes pedidos"
              description="Cuando completes tu primera compra, aparecerá aquí con su estado y seguimiento."
              action={
                <Link
                  to={ROUTES.catalog}
                  className="bg-primary text-white px-6 h-11 inline-flex items-center rounded-xl text-sm font-bold hover:bg-[#C4006A] transition-colors shadow-sm shadow-primary/20"
                >
                  Explorar el catálogo
                </Link>
              }
            />
          )
        ) : (
          <>
            <div
              className={`space-y-4 mb-10 transition-opacity ${isFetching ? 'opacity-60' : ''}`}
            >
              {orders.map((order) => (
                <OrderCard key={order.orderId} order={order} />
              ))}
            </div>

            <Pagination
              page={data?.page ?? 1}
              totalPages={data?.totalPages ?? 1}
              onPageChange={(next) => {
                const params = new URLSearchParams(searchParams);
                params.set('page', next.toString());
                setSearchParams(params);
              }}
            />
          </>
        )}
      </div>
    </main>
  );
}
