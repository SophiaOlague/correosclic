import type { Appearance } from '@stripe/stripe-js';

/**
 * Apariencia del Payment Element, derivada de los tokens de `theme.css`.
 *
 * Los valores replican las variables del diseño de Figma —magenta `#E4007C`,
 * gris de campo `#F5F6F8`, radio `0.75rem`, Inter— para que el formulario de
 * Stripe no se vea como una pieza pegada de otro sistema. Se declaran de forma
 * literal porque el iframe de Stripe vive fuera de nuestro documento y no
 * puede leer nuestras variables CSS.
 */
export const stripeAppearance: Appearance = {
  theme: 'stripe',

  variables: {
    colorPrimary: '#E4007C',
    colorBackground: '#ffffff',
    colorText: '#222222',
    colorTextSecondary: '#717182',
    colorDanger: '#EF4444',
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSizeBase: '14px',
    borderRadius: '12px',
    spacingUnit: '4px',
  },

  rules: {
    '.Input': {
      backgroundColor: '#F5F6F8',
      border: '2px solid transparent',
      boxShadow: 'none',
      padding: '12px 16px',
    },
    '.Input:focus': {
      backgroundColor: '#ffffff',
      border: '2px solid #E4007C',
      boxShadow: 'none',
    },
    '.Input--invalid': {
      backgroundColor: 'rgba(239, 68, 68, 0.05)',
      border: '2px solid #EF4444',
      boxShadow: 'none',
    },
    '.Label': {
      fontWeight: '700',
      fontSize: '12px',
      color: '#222222',
      marginBottom: '6px',
    },
    '.Tab': {
      backgroundColor: '#ffffff',
      border: '2px solid rgba(0, 0, 0, 0.08)',
      boxShadow: 'none',
    },
    '.Tab--selected': {
      backgroundColor: 'rgba(228, 0, 124, 0.05)',
      border: '2px solid #E4007C',
      color: '#E4007C',
      boxShadow: 'none',
    },
    '.Error': {
      fontSize: '12px',
      fontWeight: '600',
    },
  },
};
