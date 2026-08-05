import { MessageCircle, Star } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { useProductQuestions, useProductReviews } from '@/features/catalog/hooks/useCatalogQueries';
import type { ProductDetailDto } from '@/types/catalog';
import { formatNumber } from '@/utils/format';

type TabId = 'desc' | 'qa' | 'reviews';

/**
 * Pestañas del detalle: descripción, preguntas y opiniones.
 * Markup del export de Figma; la descripción sale del producto real y las
 * otras dos siguen con datos de ejemplo servidos por `catalogApi`.
 */
export function ProductTabs({ product }: { product: ProductDetailDto }) {
  const [activeTab, setActiveTab] = useState<TabId>('desc');

  // Las opiniones no existen en el esquema: si el producto no las trae, la
  // pestaña ni siquiera se ofrece, en vez de mostrar "Opiniones (0)".
  const tieneOpiniones = product.calificacion !== undefined || product.totalOpiniones !== undefined;

  const tabs: { id: TabId; label: string }[] = [
    { id: 'desc', label: 'Descripción' },
    { id: 'qa', label: 'Preguntas y Respuestas' },
    ...(tieneOpiniones
      ? [
          {
            id: 'reviews' as const,
            label: `Opiniones (${formatNumber(product.totalOpiniones ?? 0)})`,
          },
        ]
      : []),
  ];

  return (
    <div className="border-t border-border pt-10" id="reviews">
      <div className="flex gap-6 mb-8 border-b border-border overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-base font-bold pb-4 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-4xl">
        {activeTab === 'desc' && <DescriptionTab product={product} />}
        {activeTab === 'qa' && <QuestionsTab productId={product.id} />}
        {activeTab === 'reviews' && tieneOpiniones && <ReviewsTab product={product} />}
      </div>
    </div>
  );
}

function DescriptionTab({ product }: { product: ProductDetailDto }) {
  if (!product.descripcion) {
    return (
      <p className="text-sm text-muted-foreground">
        Este producto todavía no tiene descripción.
      </p>
    );
  }

  return (
    <div className="space-y-6 text-foreground leading-relaxed">
      {product.descripcion.split('\n\n').map((paragraph, index) => (
        <p key={index} className={index > 0 ? 'text-muted-foreground' : undefined}>
          {paragraph}
        </p>
      ))}

      <div className="pt-4 border-t border-border">
        <p className="font-bold text-foreground mb-3">Ficha técnica</p>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <Spec label="Peso" value={`${product.pesoKg} kg`} />
          <Spec label="SKU base" value={product.variantes[0]?.sku ?? '—'} />
          <Spec label="Categoría" value={product.categoria.nombre} />
          <Spec label="Vendido por" value={product.tienda.nombre} />
          {product.altoCm && <Spec label="Alto" value={`${product.altoCm} cm`} />}
          {product.anchoCm && <Spec label="Ancho" value={`${product.anchoCm} cm`} />}
          {product.largoCm && <Spec label="Largo" value={`${product.largoCm} cm`} />}
        </dl>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-border/60">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground text-right">{value}</dd>
    </div>
  );
}

function QuestionsTab({ productId }: { productId: string }) {
  const { data: questions, isLoading } = useProductQuestions(productId);

  return (
    <div>
      {/* TODO: Backend integration pending — no existe módulo de preguntas. */}
      <form
        className="flex gap-4 mb-8"
        onSubmit={(event) => {
          event.preventDefault();
          toast.info('Las preguntas al vendedor estarán disponibles próximamente.');
        }}
      >
        <input
          type="text"
          aria-label="Tu pregunta al vendedor"
          placeholder="Escribe tu pregunta al vendedor..."
          className="flex-1 bg-[#F5F6F8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          className="bg-primary text-white px-6 rounded-xl text-sm font-bold hover:bg-[#C4006A] transition-colors"
        >
          Preguntar
        </button>
      </form>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="h-20 bg-[#F5F6F8] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {questions?.map((question) => (
            <div key={question.id} className="flex gap-4">
              <MessageCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-foreground font-medium mb-1">{question.pregunta}</p>
                <div className="flex items-start gap-2 bg-[#F5F6F8] p-3 rounded-xl rounded-tl-none">
                  <p className="text-sm text-muted-foreground">{question.respuesta}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewsTab({ product }: { product: ProductDetailDto }) {
  const { data: reviews, isLoading } = useProductReviews(product.id);

  const distribution = [85, 10, 3, 1, 1];

  return (
    <div className="flex flex-col md:flex-row gap-10">
      <div className="w-64 shrink-0">
        <p className="text-5xl font-black text-foreground mb-2">{product.calificacion ?? '—'}</p>
        <div className="flex mb-2">
          {[...Array(5)].map((_, index) => (
            <Star
              key={`rev-star-${index}`}
              className={`w-5 h-5 ${index < Math.floor(product.calificacion ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-border'}`}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Basado en {formatNumber(product.totalOpiniones ?? 0)} opiniones
        </p>

        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars, index) => (
            <div key={`star-bar-${stars}`} className="flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground w-2">{stars}</span>
              <div className="flex-1 h-2 bg-[#F5F6F8] rounded-full overflow-hidden">
                <div className="h-full bg-amber-400" style={{ width: `${distribution[index]}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-8">
        {isLoading
          ? [...Array(2)].map((_, index) => (
              <div key={index} className="h-32 bg-[#F5F6F8] rounded-xl animate-pulse" />
            ))
          : reviews?.map((review) => (
              <div key={review.id} className="border-b border-border pb-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={`r-star-${index}`}
                        className={`w-3.5 h-3.5 ${index < review.calificacion ? 'fill-amber-400 text-amber-400' : 'text-border'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{review.fecha}</span>
                </div>
                <p className="text-sm text-foreground font-semibold mb-2">{review.titulo}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{review.texto}</p>
                <div className="flex items-center gap-2">
                  <img src={review.avatarUrl} alt="" className="w-6 h-6 rounded-full" />
                  <span className="text-xs font-medium text-foreground">{review.autor}</span>
                  {review.compraVerificada && (
                    <span className="text-xs text-[#006847] bg-[#006847]/10 px-2 py-0.5 rounded-full font-bold ml-2">
                      Compra Verificada
                    </span>
                  )}
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
