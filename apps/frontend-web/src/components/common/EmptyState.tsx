import { AlertTriangle, PackageSearch, RotateCcw, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Estado vacío. El export de Figma no contemplaba ninguno: siempre había datos.
 * Usa los mismos tokens del diseño (tarjeta blanca, radio 2xl, borde suave).
 */
export function EmptyState({
  icon: Icon = PackageSearch,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="bg-white border border-border rounded-2xl px-6 py-16 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#F5F6F8] flex items-center justify-center mb-5">
        <Icon className="w-7 h-7 text-muted-foreground" />
      </div>

      <p className="text-lg font-black text-foreground mb-2">{title}</p>

      {description && (
        <p className="text-sm text-muted-foreground max-w-md leading-relaxed">{description}</p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/** Estado de error, con reintento. */
export function ErrorState({
  title = 'No pudimos cargar esta información',
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="bg-white border border-destructive/20 rounded-2xl px-6 py-16 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-5">
        <AlertTriangle className="w-7 h-7 text-destructive" />
      </div>

      <p className="text-lg font-black text-foreground mb-2">{title}</p>

      {description && (
        <p className="text-sm text-muted-foreground max-w-md leading-relaxed">{description}</p>
      )}

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 bg-primary text-white px-5 h-11 rounded-xl text-sm font-bold hover:bg-[#C4006A] transition-colors shadow-sm shadow-primary/20"
        >
          <RotateCcw className="w-4 h-4" />
          Reintentar
        </button>
      )}
    </div>
  );
}
