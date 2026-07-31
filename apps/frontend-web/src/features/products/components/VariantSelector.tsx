import type { ProductVariantDto } from '@/types/catalog';

/**
 * Selector de variante.
 *
 * Es la pieza clave del embudo de compra: `POST /cart/items` no acepta un
 * producto, sino un `productoVarianteId` concreto. El diseño mostraba tres
 * colores fijos; aquí se generan a partir de las variantes reales y las que no
 * tienen stock quedan visibles pero deshabilitadas.
 */
export function VariantSelector({
  variants,
  selectedId,
  onSelect,
}: {
  variants: ProductVariantDto[];
  selectedId: string | null;
  onSelect: (variantId: string) => void;
}) {
  const activas = variants.filter((variant) => variant.activa);

  if (activas.length === 0) return null;

  // Todas las variantes de un producto comparten el mismo atributo
  // (Color, Talla, Almacenamiento...), así que basta con leer el de la primera.
  const attributeName = activas[0].atributos[0]?.atributo ?? 'Opción';
  const selected = activas.find((variant) => variant.id === selectedId);

  return (
    <div className="mb-6">
      <p className="text-sm font-bold text-foreground mb-2">
        {attributeName}:{' '}
        <span className="font-normal text-muted-foreground">
          {selected ? labelOf(selected) : 'elige una opción'}
        </span>
      </p>

      <div className="flex gap-3 flex-wrap">
        {activas.map((variant) => {
          const agotada = variant.stockDisponible <= 0;
          const isSelected = variant.id === selectedId;

          return (
            <button
              key={variant.id}
              type="button"
              disabled={agotada}
              onClick={() => onSelect(variant.id)}
              title={agotada ? 'Sin stock disponible' : undefined}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                isSelected
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-border text-foreground hover:border-primary/30'
              } ${agotada ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
            >
              {labelOf(variant)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function labelOf(variant: ProductVariantDto): string {
  return variant.atributos.map((attribute) => attribute.valor).join(' · ');
}
