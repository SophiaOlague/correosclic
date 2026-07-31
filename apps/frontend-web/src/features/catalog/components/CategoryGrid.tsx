import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

import { ROUTES } from '@/constants/routes';
import { formatNumber } from '@/utils/format';

import { useCategories } from '../hooks/useCatalogQueries';
import { categoryVisual } from '../lib/category-visuals';

/**
 * Rejilla de categorías de la portada. Markup del export de Figma; los datos
 * vienen de `catalogApi.listCategories()` y cada tarjeta filtra el catálogo.
 */
export function CategoryGrid() {
  const { data: categories, isLoading } = useCategories();
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Categorías</p>
            <h2 className="text-3xl font-black text-foreground tracking-tight">
              Explora por categoría
            </h2>
          </div>
          <Link
            to={ROUTES.catalog}
            className="hidden sm:flex items-center gap-2 text-sm font-semibold text-primary hover:text-[#C4006A] transition-colors"
          >
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
          {isLoading
            ? [...Array(8)].map((_, index) => (
                <div
                  key={`cat-skeleton-${index}`}
                  className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-border bg-white"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#F5F6F8] animate-pulse" />
                  <div className="w-full space-y-1.5">
                    <div className="h-3 bg-[#F5F6F8] rounded animate-pulse" />
                    <div className="h-3 w-2/3 mx-auto bg-[#F5F6F8] rounded animate-pulse" />
                  </div>
                </div>
              ))
            : categories?.map((category) => {
                const { icon: Icon, light, text } = categoryVisual(category.slug);

                return (
                  <button
                    key={category.id}
                    onClick={() => navigate(`${ROUTES.catalog}?categoria=${category.id}`)}
                    className="group flex flex-col items-center gap-3 p-4 rounded-2xl border border-border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/8 hover:-translate-y-1 transition-all duration-200 bg-white"
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl ${light} ${text} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-foreground leading-tight">
                        {category.nombre}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatNumber(category.productCount)}
                      </p>
                    </div>
                  </button>
                );
              })}
        </div>
      </div>
    </section>
  );
}
