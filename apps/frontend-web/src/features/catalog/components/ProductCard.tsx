import { Heart, Plus, Star, Truck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';

import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { ROUTES } from '@/constants/routes';
import type { ProductListItemDto } from '@/types/catalog';
import { formatMoney, formatNumber } from '@/utils/format';

/**
 * Tarjeta de producto. Markup idéntico al del export de Figma; lo que cambia
 * es el origen de los datos (`ProductListItemDto` en vez del objeto `Product`
 * hardcodeado) y que ahora es un enlace real al detalle.
 */
export function ProductCard({ product, delay = 0 }: { product: ProductListItemDto; delay?: number }) {
  const [liked, setLiked] = useState(false);

  const agotado = product.stockTotal <= 0;

  return (
    <Link
      to={`${ROUTES.product}/${product.id}`}
      className="bg-white rounded-2xl border border-border overflow-hidden group hover:shadow-2xl hover:shadow-primary/8 hover:-translate-y-1 transition-all duration-300 cursor-pointer block"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative aspect-square bg-[#F5F6F8] overflow-hidden">
        {product.imagenPrincipalUrl && (
          <ImageWithFallback
            src={product.imagenPrincipalUrl}
            alt={product.nombre}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}

        {product.etiqueta && (
          <span className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
            {product.etiqueta}
          </span>
        )}

        {agotado && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-foreground text-white text-xs font-bold px-3 py-1.5 rounded-lg">
              Agotado
            </span>
          </div>
        )}

        <button
          type="button"
          aria-label={liked ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setLiked(!liked);
            // TODO: Backend integration pending — no existe módulo de favoritos.
            if (!liked) toast.success('Agregado a favoritos');
          }}
        >
          <Heart
            className={`w-4 h-4 transition-colors duration-200 ${liked ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
          />
        </button>
      </div>

      <div className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{product.tienda.nombre}</p>
        <p className="text-sm font-medium text-foreground line-clamp-2 mb-2 leading-snug">
          {product.nombre}
        </p>

        {product.calificacion !== undefined && (
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={`pcard-star-${index}`}
                  className={`w-3 h-3 ${index < Math.floor(product.calificacion!) ? 'fill-amber-400 text-amber-400' : 'text-border'}`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({formatNumber(product.totalOpiniones ?? 0)})
            </span>
          </div>
        )}

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-bold text-foreground">{formatMoney(product.precioDesde)}</span>
          {product.precioAnterior && (
            <span className="text-xs text-muted-foreground line-through">
              {formatMoney(product.precioAnterior)}
            </span>
          )}
        </div>

        {product.envioGratis && (
          <p className="text-xs text-[#006847] font-semibold mb-3 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" />
            Envío gratis
          </p>
        )}

        <button
          type="button"
          disabled={agotado}
          className="w-full h-9 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-[#C4006A] active:bg-[#A30059] transition-colors flex items-center justify-center gap-2 shadow-sm shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            // TODO: Módulo 3 — agregar al carrito requiere elegir variante
            // (POST /cart/items espera un productoVarianteId concreto).
            toast.info('Elige una variante en la página del producto para agregarlo al carrito.');
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          Agregar al carrito
        </button>
      </div>
    </Link>
  );
}

/** Esqueleto con la misma silueta que la tarjeta, para los estados de carga. */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="aspect-square bg-[#F5F6F8] animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-20 bg-[#F5F6F8] rounded animate-pulse" />
        <div className="h-4 w-full bg-[#F5F6F8] rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-[#F5F6F8] rounded animate-pulse" />
        <div className="h-6 w-28 bg-[#F5F6F8] rounded animate-pulse" />
        <div className="h-9 w-full bg-[#F5F6F8] rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
