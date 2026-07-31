import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Paginación del catálogo. Conserva el estilo del export de Figma (botones de
 * 40px, radio xl, activo en magenta) y le da comportamiento real: calcula la
 * ventana de páginas visibles y desactiva los extremos.
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = visiblePages(page, totalPages);

  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-border text-muted-foreground hover:bg-[#F5F6F8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {pages.map((item, index) =>
        item === '...' ? (
          <span
            key={`gap-${index}`}
            className="w-10 h-10 flex items-center justify-center text-sm font-bold text-muted-foreground"
          >
            ...
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            aria-current={item === page ? 'page' : undefined}
            className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-colors ${
              item === page
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-white border border-border text-foreground hover:bg-[#F5F6F8]'
            }`}
          >
            {item}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Página siguiente"
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-border text-foreground hover:bg-[#F5F6F8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </nav>
  );
}

/** Primera, última, y una ventana alrededor de la actual; el resto con "...". */
function visiblePages(page: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const window = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  const sorted = [...window].filter((item) => item >= 1 && item <= totalPages).sort((a, b) => a - b);

  const result: (number | '...')[] = [];

  sorted.forEach((item, index) => {
    if (index > 0 && item - (sorted[index - 1] as number) > 1) result.push('...');
    result.push(item);
  });

  return result;
}
