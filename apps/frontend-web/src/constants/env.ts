/**
 * Configuración leída de las variables de entorno de Vite.
 *
 * El backend de CorreosClic monta todos sus controladores bajo el prefijo
 * global `/api` (ver `apps/backend/src/main.ts`), por eso el valor por defecto
 * ya lo incluye.
 */
export const API_URL: string =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export const STRIPE_PUBLISHABLE_KEY: string =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '';

export const IS_DEV: boolean = import.meta.env.DEV;
