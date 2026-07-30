import { Check } from 'lucide-react';
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

/**
 * Casilla de las pantallas de autenticación.
 *
 * Mantiene el patrón visual del diseño (`group-has-[:checked]`), cambiando
 * `hidden` por `sr-only` para que la casilla siga siendo enfocable con teclado:
 * un input `hidden` queda fuera del orden de tabulación.
 */
interface AuthCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  children: ReactNode;
  error?: string;
  align?: 'center' | 'start';
}

export const AuthCheckbox = forwardRef<HTMLInputElement, AuthCheckboxProps>(
  function AuthCheckbox({ children, error, align = 'center', id, ...props }, ref) {
    const fieldId = id ?? props.name;
    const errorId = `${fieldId}-error`;

    const isStart = align === 'start';

    return (
      <div>
        <label
          htmlFor={fieldId}
          className={`flex ${isStart ? 'items-start gap-3' : 'items-center gap-2'} cursor-pointer group`}
        >
          <div
            className={[
              isStart ? 'w-5 h-5 mt-0.5 bg-white shrink-0' : 'w-4 h-4',
              'rounded border flex items-center justify-center transition-colors',
              error ? 'border-destructive' : 'border-border group-hover:border-primary',
            ].join(' ')}
          >
            <Check
              className={`${isStart ? 'w-3.5 h-3.5' : 'w-3 h-3'} text-white bg-primary rounded-sm hidden group-has-[:checked]:block`}
            />
          </div>

          <input
            {...props}
            ref={ref}
            id={fieldId}
            type="checkbox"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className="sr-only"
          />

          <span
            className={
              isStart
                ? 'text-sm font-medium text-muted-foreground leading-snug'
                : 'text-sm font-semibold text-muted-foreground'
            }
          >
            {children}
          </span>
        </label>

        {error && (
          <p id={errorId} role="alert" className="mt-1.5 text-xs font-semibold text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  },
);
