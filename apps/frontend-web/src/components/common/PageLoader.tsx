import { Loader2 } from 'lucide-react';

/** Fallback de `<Suspense>` mientras se descarga el chunk de una ruta. */
export function PageLoader({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[60vh] flex flex-col items-center justify-center gap-4"
    >
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
    </div>
  );
}

/** Variante a pantalla completa, para cuando aún no hay layout montado. */
export function FullPageLoader({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white"
    >
      <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
        <span className="text-white font-black tracking-tight">CC</span>
      </div>
      <div className="flex items-center gap-2.5">
        <Loader2 className="w-4 h-4 text-primary animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
