import { z } from 'zod';

import { systemConfigMeta } from '../lib/system-config';

/**
 * Réplica de las reglas de `class-validator` de
 * `apps/backend/src/admin/application/dto/`, con mensajes en español. El
 * backend sigue siendo la autoridad: ante cualquier discrepancia manda el DTO.
 */

/** `ApproveSellerRequestDto` — `@IsUUID()`, sin opcionalidad. */
export const approveSellerRequestSchema = z.object({
  estadoOperacionId: z
    .string()
    .uuid('Selecciona el estado desde el que operará el vendedor.'),
});

export type ApproveSellerRequestFormValues = z.infer<typeof approveSellerRequestSchema>;

export const APPROVE_SELLER_REQUEST_FIELDS = ['estadoOperacionId'] as const;

/** `RejectSellerRequestDto` — `@IsString() @IsNotEmpty() @MaxLength(500)`. */
export const rejectSellerRequestSchema = z.object({
  comentariosRevision: z
    .string()
    .trim()
    .min(1, 'Escribe el motivo del rechazo: es lo que verá el solicitante.')
    .max(500, 'El motivo no puede superar los 500 caracteres.'),
});

export type RejectSellerRequestFormValues = z.infer<typeof rejectSellerRequestSchema>;

export const REJECT_SELLER_REQUEST_FIELDS = ['comentariosRevision'] as const;

/**
 * `UpdateSystemConfigDto` — `@IsString() @IsNotEmpty() @MaxLength(255)`.
 *
 * El backend valida solo eso porque `ConfiguracionSistema.valor` es texto y
 * cada consumidor lo interpreta a su manera. Aquí se añade la forma que espera
 * quien lo lee (`getNumber` devuelve `NaN` con un texto no numérico, y ese
 * `NaN` acabaría dentro del total de un pedido), igual que el RFC del
 * onboarding valida el formato oficial que el backend no comprueba.
 */
export function systemConfigValueSchema(clave: string) {
  const base = z
    .string()
    .trim()
    .min(1, 'El valor no puede quedar vacío.')
    .max(255, 'El valor no puede superar los 255 caracteres.');

  const meta = systemConfigMeta(clave);

  if (!meta) return z.object({ valor: base });

  switch (meta.formato) {
    case 'porcentaje':
      return z.object({
        valor: base
          .regex(/^\d+(\.\d+)?$/, 'Debe ser un número, sin el símbolo de porcentaje.')
          .refine(
            (valor) => Number(valor) >= 0 && Number(valor) <= 100,
            'El porcentaje debe estar entre 0 y 100.',
          ),
      });

    case 'entero':
      return z.object({
        valor: base
          .regex(/^\d+$/, 'Debe ser un número entero, sin decimales.')
          .refine((valor) => Number(valor) >= 1, 'Debe ser mayor que cero.'),
      });

    case 'decimal':
      return z.object({
        valor: base
          .regex(/^\d+(\.\d+)?$/, 'Debe ser un número.')
          .refine((valor) => Number(valor) > 0, 'Debe ser mayor que cero.'),
      });

    case 'texto':
      return z.object({ valor: base });
  }
}

export type SystemConfigFormValues = { valor: string };
