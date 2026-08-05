import { ZoomIn } from 'lucide-react';
import { useState } from 'react';

import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

import type { ProductImageDto } from '@/types/catalog';

/**
 * Galería del detalle de producto: miniaturas verticales en escritorio y
 * horizontales en móvil, con la imagen grande a la derecha. Markup del export
 * de Figma; ahora recibe las imágenes reales del producto, ordenadas.
 */
export function ProductGallery({
  images,
  alt,
}: {
  images: ProductImageDto[];
  alt: string;
}) {
  const [active, setActive] = useState(0);

  const sorted = [...images].sort((a, b) => a.orden - b.orden);
  const current = sorted[active] ?? sorted[0];

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {sorted.length > 1 && (
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto scrollbar-hide w-full md:w-20 shrink-0">
          {sorted.map((image, index) => (
            <button
              key={image.id}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
              aria-label={`Ver imagen ${index + 1} de ${sorted.length}`}
              className={`w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                active === index
                  ? 'border-primary opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <ImageWithFallback src={image.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="relative flex-1 aspect-square bg-[#F5F6F8] rounded-2xl overflow-hidden group cursor-zoom-in">
        {current && (
          <ImageWithFallback
            src={current.url}
            alt={alt}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}
        <div className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-foreground pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
