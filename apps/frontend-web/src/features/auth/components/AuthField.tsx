import { Eye, EyeOff, type LucideIcon } from 'lucide-react';
import { forwardRef, useState, type InputHTMLAttributes } from 'react';

/**
 * Campo de formulario de las pantallas de autenticación.
 *
 * Reproduce exactamente el input del diseño de Figma (fondo `#F5F6F8`, borde
 * de 2px que se vuelve magenta al enfocar, icono a la izquierda) y le añade lo
 * que el export no tenía: etiqueta asociada, estado de error y accesibilidad.
 */
interface AuthFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  icon: LucideIcon;
  error?: string;
  /** Añade el botón de mostrar/ocultar contraseña. */
  revealable?: boolean;
  /** Compacto (`py-3`) como en Registro, o alto (`py-3.5`) como en Login. */
  size?: 'md' | 'lg';
}

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(function AuthField(
  { label, icon: Icon, error, revealable = false, size = 'md', className, id, ...props },
  ref,
) {
  const [revealed, setRevealed] = useState(false);

  const fieldId = id ?? props.name;
  const errorId = `${fieldId}-error`;

  const padding = size === 'lg' ? 'py-3.5' : 'py-3';
  const rightPadding = revealable ? 'pr-12' : 'pr-4';

  return (
    <div>
      <label htmlFor={fieldId} className="block text-xs font-bold text-foreground mb-1.5">
        {label}
      </label>

      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />

        <input
          {...props}
          ref={ref}
          id={fieldId}
          type={revealable ? (revealed ? 'text' : 'password') : props.type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={[
            'w-full bg-[#F5F6F8] border-2 rounded-xl pl-12 text-sm outline-none transition-all',
            padding,
            rightPadding,
            error
              ? 'border-destructive focus:border-destructive bg-destructive/5'
              : 'border-transparent focus:border-primary focus:bg-white',
            className ?? '',
          ].join(' ')}
        />

        {revealable && (
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            aria-label={revealed ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {revealed ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>

      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-semibold text-destructive">
          {error}
        </p>
      )}
    </div>
  );
});
