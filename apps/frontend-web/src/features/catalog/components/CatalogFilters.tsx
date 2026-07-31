import { Check, SlidersHorizontal, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

import { formatNumber } from '@/utils/format';

import { useCategories } from '../hooks/useCatalogQueries';

export interface CatalogFilterValues {
  categoriaId?: string;
  precioMin?: number;
  precioMax?: number;
  soloOfertas?: boolean;
}

/**
 * Panel lateral de filtros. Markup del export de Figma, ahora funcional:
 * categoría y rango de precio se aplican de verdad contra `catalogApi`.
 *
 * Los bloques de Calificación, Condición y Disponibilidad se conservan porque
 * forman parte del diseño, pero quedan deshabilitados: ninguno tiene respaldo
 * en el esquema (no hay reseñas, ni condición del artículo, ni envío por
 * producto — el envío lo cotiza Checkout por vendedor).
 * TODO: Backend integration pending — ver PENDING_INTEGRATIONS.md.
 */
export function CatalogFilters({
  values,
  onChange,
  onClear,
}: {
  values: CatalogFilterValues;
  onChange: (values: CatalogFilterValues) => void;
  onClear: () => void;
}) {
  const { data: categories } = useCategories();

  const [showAllCategories, setShowAllCategories] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  // Refleja los filtros que vienen de la URL cuando cambian desde fuera.
  useEffect(() => {
    setPriceMin(values.precioMin?.toString() ?? '');
    setPriceMax(values.precioMax?.toString() ?? '');
  }, [values.precioMin, values.precioMax]);

  const visibleCategories = showAllCategories ? categories : categories?.slice(0, 5);

  return (
    <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
        <SlidersHorizontal className="w-5 h-5 text-primary" />
        <h2 className="font-bold text-foreground">Filtros</h2>
        <button
          onClick={onClear}
          className="ml-auto text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          Limpiar
        </button>
      </div>

      <div className="space-y-8">
        {/* Categoría */}
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">Categoría</h3>
          <div className="space-y-2.5">
            {visibleCategories?.map((category) => {
              const checked = values.categoriaId === category.id;

              return (
                <label
                  key={category.id}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${checked ? 'border-primary' : 'border-border group-hover:border-primary'}`}
                  >
                    {checked && <Check className="w-3 h-3 text-white bg-primary rounded-sm" />}
                  </div>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={() =>
                      onChange({ ...values, categoriaId: checked ? undefined : category.id })
                    }
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground">
                    {category.nombre}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground/60">
                    {formatNumber(category.productCount)}
                  </span>
                </label>
              );
            })}

            {(categories?.length ?? 0) > 5 && (
              <button
                onClick={() => setShowAllCategories((value) => !value)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                {showAllCategories ? 'Ver menos categorías' : 'Ver más categorías'}
              </button>
            )}
          </div>
        </div>

        {/* Precio */}
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">Precio</h3>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
              <input
                type="number"
                min={0}
                value={priceMin}
                onChange={(event) => setPriceMin(event.target.value)}
                placeholder="Min"
                aria-label="Precio mínimo"
                className="w-full pl-5 pr-2 py-1.5 bg-[#F5F6F8] rounded-lg text-sm border-transparent focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <span className="text-muted-foreground">-</span>
            <div className="relative flex-1">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
              <input
                type="number"
                min={0}
                value={priceMax}
                onChange={(event) => setPriceMax(event.target.value)}
                placeholder="Max"
                aria-label="Precio máximo"
                className="w-full pl-5 pr-2 py-1.5 bg-[#F5F6F8] rounded-lg text-sm border-transparent focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
          </div>
          <button
            onClick={() =>
              onChange({
                ...values,
                precioMin: priceMin ? Number(priceMin) : undefined,
                precioMax: priceMax ? Number(priceMax) : undefined,
              })
            }
            className="w-full bg-[#F5F6F8] hover:bg-accent hover:text-primary text-foreground text-xs font-bold py-2 rounded-lg transition-colors"
          >
            Aplicar precio
          </button>
        </div>

        {/* Ofertas */}
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">Promociones</h3>
          <label className="flex items-start gap-3 cursor-pointer group">
            <div
              className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center transition-colors ${values.soloOfertas ? 'border-primary' : 'border-border group-hover:border-primary'}`}
            >
              {values.soloOfertas && <Check className="w-3 h-3 text-white bg-primary rounded-sm" />}
            </div>
            <input
              type="checkbox"
              className="sr-only"
              checked={Boolean(values.soloOfertas)}
              onChange={() => onChange({ ...values, soloOfertas: !values.soloOfertas })}
            />
            <div>
              <span className="text-sm text-foreground block font-medium">Solo ofertas</span>
              <span className="text-xs text-muted-foreground">Productos con precio rebajado</span>
            </div>
          </label>
        </div>

        {/* Calificación — sin respaldo en el backend */}
        <DisabledFilterGroup title="Calificación">
          <div className="space-y-2">
            {[4, 3, 2, 1].map((stars) => (
              <div key={`star-filter-${stars}`} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded border border-border" />
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      className={`w-3.5 h-3.5 ${index < stars ? 'fill-amber-400 text-amber-400' : 'text-border'}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">&amp; más</span>
              </div>
            ))}
          </div>
        </DisabledFilterGroup>

        {/* Condición — sin respaldo en el backend */}
        <DisabledFilterGroup title="Condición">
          <div className="space-y-2.5">
            {['Nuevo', 'Reacondicionado', 'Usado'].map((condition) => (
              <div key={condition} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded border border-border" />
                <span className="text-sm text-muted-foreground">{condition}</span>
              </div>
            ))}
          </div>
        </DisabledFilterGroup>
      </div>
    </div>
  );
}

/** Bloque de filtro presente en el diseño pero aún sin datos que lo soporten. */
function DisabledFilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div aria-disabled className="opacity-40 pointer-events-none select-none">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground bg-[#F5F6F8] px-1.5 py-0.5 rounded">
          Próximamente
        </span>
      </div>
      {children}
    </div>
  );
}
