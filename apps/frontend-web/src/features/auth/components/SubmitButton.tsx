import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Botón principal de los formularios de autenticación, con estado de carga.
 * Conserva el estilo del diseño (alto 14, magenta, sombra) y añade el spinner
 * y el bloqueo mientras la petición está en vuelo.
 */
export function SubmitButton({
  children,
  isLoading,
  loadingLabel,
  className = '',
}: {
  children: ReactNode;
  isLoading: boolean;
  loadingLabel: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className={`w-full bg-primary text-white h-14 rounded-xl font-bold text-lg hover:bg-[#C4006A] transition-colors shadow-lg shadow-primary/25 flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
      {isLoading ? loadingLabel : children}
    </button>
  );
}
