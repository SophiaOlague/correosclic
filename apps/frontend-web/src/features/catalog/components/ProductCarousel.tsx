import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { ROUTES } from '@/constants/routes';
import type { ProductListQuery } from '@/types/catalog';

import { useProducts } from '../hooks/useCatalogQueries';
import { ProductCard, ProductCardSkeleton } from './ProductCard';

/**
 * Carrusel horizontal de productos de la portada. Markup del export de Figma;
 * cada instancia lanza su propia consulta a `catalogApi.listProducts` con el
 * filtro que le corresponda, igual que hará con el endpoint real.
 */
export function ProductCarousel({
  title,
  query,
  bg = 'bg-white',
  icon,
}: {
  title: string;
  query: ProductListQuery;
  bg?: string;
  icon?: ReactNode;
}) {
  const { data, isLoading } = useProducts(query);

  const products = data?.products ?? [];

  // Una sección de portada vacía no aporta nada: mejor no renderizarla.
  if (!isLoading && products.length === 0) return null;

  return (
    <section className={`py-12 ${bg}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                {icon}
              </div>
            )}
            <h2 className="text-2xl font-black text-foreground tracking-tight">{title}</h2>
          </div>

          <Link
            to={buildCatalogLink(query)}
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-primary hover:text-[#C4006A] transition-colors"
          >
            Ver más <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-6 scrollbar-hide snap-x">
          {isLoading
            ? [...Array(4)].map((_, index) => (
                <div key={`carousel-skeleton-${index}`} className="min-w-[260px] max-w-[260px]">
                  <ProductCardSkeleton />
                </div>
              ))
            : products.map((product, index) => (
                <div key={product.id} className="min-w-[260px] max-w-[260px] snap-start">
                  <ProductCard product={product} delay={index * 50} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}

/** "Ver más" lleva al catálogo conservando el filtro de la sección. */
function buildCatalogLink(query: ProductListQuery): string {
  const params = new URLSearchParams();

  if (query.orden) params.set('orden', query.orden);
  if (query.soloOfertas) params.set('ofertas', '1');

  const serialized = params.toString();

  return serialized ? `${ROUTES.catalog}?${serialized}` : ROUTES.catalog;
}
