import { Package, PlusCircle, Search, Store, Truck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { PageLoader } from '@/components/common/PageLoader';
import { ROUTES } from '@/constants/routes';

import { ProductTable } from '../components/ProductTable';
import { StoreForm } from '../components/StoreForm';
import { useCreateStore, useSellerStore } from '../hooks/useSellerOnboarding';
import { useSellerProducts } from '../hooks/useSellerProducts';

const PAGE_SIZE = 10;

/**
 * Panel del vendedor — `/vendedor`.
 *
 * El export de Figma traía KPIs de ventas, gráfica de ingresos, últimos
 * pedidos y clientes. Nada de eso tiene respaldo: no hay endpoints de métricas
 * ni de pedidos por vendedor, así que el panel se centra en lo que sí existe
 * —la tienda y el catálogo propio— en vez de mostrar cifras inventadas.
 *
 * Sin tienda no hay catálogo posible, así que ese es el primer paso que ofrece.
 */
export default function SellerDashboardPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const store = useSellerStore();

  // El catálogo solo se consulta cuando ya hay tienda: sin ella el endpoint
  // responde 404 y la lista quedaría en error permanente.
  const products = useSellerProducts(page, PAGE_SIZE, search, Boolean(store.data));

  if (store.isLoading) return <PageLoader label="Cargando tu tienda..." />;

  if (store.fallo) {
    return (
      <main className="bg-[#F1F2F4] min-h-screen py-8">
        <div className="max-w-[1200px] mx-auto px-4">
          <ErrorState onRetry={() => store.refetch()} />
        </div>
      </main>
    );
  }

  if (store.sinTienda || !store.data) return <StoreSetup />;

  return (
    <main className="bg-[#F1F2F4] min-h-screen py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#006847] rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm">
              {store.data.logoUrl ? (
                <img
                  src={store.data.logoUrl}
                  alt=""
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <Store className="w-5 h-5" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground leading-tight">
                {store.data.nombre}
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                {store.data.codigoPublico}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={ROUTES.vendorShipments}
              className="bg-white border border-border text-foreground px-4 h-10 rounded-lg text-sm font-semibold hover:bg-accent transition-colors shadow-sm inline-flex items-center gap-2"
            >
              <Truck className="w-4 h-4" /> Envíos por entregar
            </Link>

            <Link
              to={ROUTES.sellerNewProduct}
              className="bg-[#006847] text-white px-4 h-10 rounded-lg text-sm font-semibold hover:bg-[#005439] transition-colors shadow-sm inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Nuevo producto
            </Link>
          </div>
        </header>

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-lg font-bold text-foreground">Mis productos</h2>

          <form
            className="relative w-full sm:max-w-sm"
            onSubmit={(event) => {
              event.preventDefault();
              setPage(1);
              setSearch(searchInput.trim());
            }}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar por nombre o código..."
              aria-label="Buscar productos"
              className="w-full bg-white border border-border focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-lg pl-9 pr-4 py-2 text-sm outline-none transition-all shadow-sm"
            />
          </form>
        </div>

        {/* `isPending` cubre también el intervalo en que la consulta aún no se
            ha habilitado, así que nunca queda un hueco en blanco. */}
        {products.isPending && !products.isError && (
          <div className="h-72 bg-white rounded-xl border border-border animate-pulse" />
        )}

        {products.isError && <ErrorState onRetry={() => products.refetch()} />}

        {products.data && products.data.total === 0 && search === '' ? (
          <EmptyState
            icon={Package}
            title="Todavía no tienes productos"
            description="Da de alta tu primer producto para empezar a vender. Necesitarás su categoría, peso y al menos una variante con precio y stock."
            action={
              <Link
                to={ROUTES.sellerNewProduct}
                className="bg-primary text-white px-6 h-11 inline-flex items-center gap-2 rounded-xl text-sm font-bold hover:bg-[#C4006A] transition-colors shadow-sm shadow-primary/20"
              >
                <PlusCircle className="w-4 h-4" /> Nuevo producto
              </Link>
            }
          />
        ) : (
          products.data && (
            <div className="space-y-6">
              <ProductTable products={products.data.products} />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  {products.data.total}{' '}
                  {products.data.total === 1 ? 'producto' : 'productos'}
                </p>

                <Pagination
                  page={products.data.page}
                  totalPages={products.data.totalPages}
                  onPageChange={setPage}
                />
              </div>
            </div>
          )
        )}
      </div>
    </main>
  );
}

/** El vendedor está aprobado pero aún no ha creado su tienda. */
function StoreSetup() {
  const createStore = useCreateStore();

  return (
    <main className="bg-[#F1F2F4] min-h-screen py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        <h1 className="text-2xl font-black text-foreground mb-2">Panel del vendedor</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Antes de publicar productos necesitas una tienda.
        </p>

        <StoreForm
          isPending={createStore.isPending}
          onSubmit={(values) => createStore.mutate(values)}
        />
      </div>
    </main>
  );
}
