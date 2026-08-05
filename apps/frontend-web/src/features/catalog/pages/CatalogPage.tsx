import { ChevronDown, ChevronRight, Filter, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { ROUTES } from '@/constants/routes';
import { PRODUCT_SORTS, type ProductListQuery, type ProductSort } from '@/types/catalog';
import { formatNumber } from '@/utils/format';

import { CatalogFilters, type CatalogFilterValues } from '../components/CatalogFilters';
import { ProductCard, ProductCardSkeleton } from '../components/ProductCard';
import { useCategories, useProducts } from '../hooks/useCatalogQueries';

/** Tres filas completas en la rejilla de escritorio, que es de 3 columnas. */
const PAGE_SIZE = 9;

/**
 * Catálogo de productos.
 *
 * Los filtros viven en la URL (`?q=&categoria=&min=&max=&orden=&ofertas=&page=`)
 * para que una búsqueda sea compartible y el botón "atrás" del navegador se
 * comporte como el usuario espera.
 */
export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const query = queryFromParams(searchParams);
  const { data, isLoading, isError, refetch, isFetching } = useProducts(query);
  const { data: categories } = useCategories();

  const activeCategory = categories?.find((category) => category.id === query.categoriaId);

  const update = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams);

    for (const [key, value] of Object.entries(changes)) {
      if (value === undefined || value === '') next.delete(key);
      else next.set(key, value);
    }

    // Cualquier cambio de filtro vuelve a la primera página.
    if (!('page' in changes)) next.delete('page');

    setSearchParams(next);
  };

  const filterValues: CatalogFilterValues = {
    categoriaId: query.categoriaId,
    precioMin: query.precioMin,
    precioMax: query.precioMax,
    soloOfertas: query.soloOfertas,
  };

  const onFiltersChange = (values: CatalogFilterValues) =>
    update({
      categoria: values.categoriaId,
      min: values.precioMin?.toString(),
      max: values.precioMax?.toString(),
      ofertas: values.soloOfertas ? '1' : undefined,
    });

  const products = data?.products ?? [];

  return (
    <main className="bg-[#F5F6F8] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb y título */}
        <div className="mb-6">
          <nav aria-label="Ruta" className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Link to={ROUTES.home} className="hover:text-foreground">
              Inicio
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={ROUTES.catalog} className="hover:text-foreground">
              Todas las categorías
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-semibold">
              {activeCategory?.nombre ?? 'Catálogo'}
            </span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-black text-foreground">
              {activeCategory ? activeCategory.nombre : 'Catálogo de productos'}
              <span className="text-sm font-medium text-muted-foreground ml-2">
                {isLoading
                  ? 'cargando...'
                  : `(${formatNumber(data?.total ?? 0)} ${data?.total === 1 ? 'resultado' : 'resultados'})`}
              </span>
            </h1>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-white border border-border px-3 py-2 rounded-xl text-sm font-medium shadow-sm"
              >
                <Filter className="w-4 h-4" /> Filtros
              </button>

              <div className="relative">
                <select
                  value={query.orden ?? 'relevancia'}
                  onChange={(event) => update({ orden: event.target.value })}
                  aria-label="Ordenar resultados"
                  className="appearance-none bg-white border border-border pl-4 pr-10 py-2 rounded-xl text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                >
                  {Object.entries(PRODUCT_SORTS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {query.search && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Buscando:</span>
              <span className="inline-flex items-center gap-2 bg-white border border-border rounded-full pl-3 pr-1.5 py-1 text-sm font-semibold text-foreground">
                {query.search}
                <button
                  onClick={() => update({ q: undefined })}
                  aria-label="Quitar búsqueda"
                  className="w-5 h-5 rounded-full bg-[#F5F6F8] hover:bg-accent hover:text-primary flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-8 items-start">
          {/* Filtros de escritorio */}
          <aside className="hidden lg:block w-[280px] shrink-0 sticky top-[160px]">
            <CatalogFilters
              values={filterValues}
              onChange={onFiltersChange}
              onClear={() => setSearchParams(new URLSearchParams())}
            />
          </aside>

          {/* Resultados */}
          <div className="flex-1">
            {isError ? (
              <ErrorState
                description="No pudimos cargar el catálogo. Revisa tu conexión e inténtalo de nuevo."
                onRetry={() => refetch()}
              />
            ) : isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                {[...Array(PAGE_SIZE)].map((_, index) => (
                  <ProductCardSkeleton key={`skeleton-${index}`} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                title="No encontramos productos"
                description="Prueba con otros términos de búsqueda o quita algunos filtros."
                action={
                  <button
                    onClick={() => setSearchParams(new URLSearchParams())}
                    className="bg-primary text-white px-5 h-11 rounded-xl text-sm font-bold hover:bg-[#C4006A] transition-colors shadow-sm shadow-primary/20"
                  >
                    Limpiar filtros
                  </button>
                }
              />
            ) : (
              <>
                <div
                  className={`grid grid-cols-2 md:grid-cols-3 gap-4 mb-10 transition-opacity ${isFetching ? 'opacity-60' : ''}`}
                >
                  {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} delay={(index % 4) * 50} />
                  ))}
                </div>

                <Pagination
                  page={data?.page ?? 1}
                  totalPages={data?.totalPages ?? 1}
                  onPageChange={(page) => update({ page: page.toString() })}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filtros en móvil */}
      {mobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative ml-auto w-[85%] max-w-sm h-full bg-white overflow-y-auto p-4">
            <button
              onClick={() => setMobileFiltersOpen(false)}
              aria-label="Cerrar filtros"
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-[#F5F6F8] flex items-center justify-center text-muted-foreground z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <CatalogFilters
              values={filterValues}
              onChange={onFiltersChange}
              onClear={() => setSearchParams(new URLSearchParams())}
            />
          </div>
        </div>
      )}
    </main>
  );
}

function queryFromParams(params: URLSearchParams): ProductListQuery {
  const orden = params.get('orden');

  return {
    page: Number(params.get('page')) || 1,
    limit: PAGE_SIZE,
    search: params.get('q') ?? undefined,
    categoriaId: params.get('categoria') ?? undefined,
    precioMin: params.get('min') ? Number(params.get('min')) : undefined,
    precioMax: params.get('max') ? Number(params.get('max')) : undefined,
    soloOfertas: params.get('ofertas') === '1' ? true : undefined,
    orden: orden && orden in PRODUCT_SORTS ? (orden as ProductSort) : undefined,
  };
}
