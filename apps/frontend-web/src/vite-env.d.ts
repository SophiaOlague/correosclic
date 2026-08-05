/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base de la API de CorreosClic, incluyendo el prefijo global `/api`. */
  readonly VITE_API_URL: string;
  /** Clave publicable de Stripe (`pk_test_...` / `pk_live_...`). */
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
