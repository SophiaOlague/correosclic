import { loadStripe, type Stripe } from '@stripe/stripe-js';

import { STRIPE_PUBLISHABLE_KEY } from '@/constants/env';

/**
 * Carga de Stripe.js.
 *
 * Se resuelve **una sola vez fuera del ciclo de render**, como recomienda
 * Stripe: crear la promesa dentro de un componente volvería a cargar el script
 * en cada render.
 *
 * Este archivo y `PaymentForm.tsx` son los únicos que importan el SDK de
 * Stripe; ningún módulo fuera de `features/payments` debe hacerlo.
 */
export const stripePromise: Promise<Stripe | null> = STRIPE_PUBLISHABLE_KEY
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : Promise.resolve(null);

/** `true` si la clave publicable está configurada y tiene forma válida. */
export function hasStripeKey(): boolean {
  return /^pk_(test|live)_[A-Za-z0-9]{20,}$/.test(STRIPE_PUBLISHABLE_KEY);
}
