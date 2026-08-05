import { z } from 'zod';

/**
 * Réplica de las reglas de `class-validator` de los DTOs del backend, con
 * mensajes en español. El backend sigue siendo la autoridad: ante cualquier
 * discrepancia manda el DTO.
 *
 * Backend: `apps/backend/src/seller/application/dto/` y
 * `apps/backend/src/catalog/application/dto/`.
 */

/** `CreateFiscalInformationDto` — los tres campos son obligatorios. */
export const fiscalInformationSchema = z.object({
  rfc: z
    .string()
    .min(1, 'Ingresa tu RFC.')
    .max(20, 'El RFC no puede superar los 20 caracteres.')
    // El backend solo valida longitud; aquí se añade el formato oficial para
    // evitar un viaje de ida y vuelta con un RFC obviamente mal escrito.
    .regex(
      /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/i,
      'El RFC no tiene un formato válido. Ejemplo: GODE561231GR8.',
    ),
  razonSocial: z
    .string()
    .min(1, 'Ingresa tu razón social o nombre completo.')
    .max(255, 'La razón social no puede superar los 255 caracteres.'),
  regimenFiscal: z
    .string()
    .min(1, 'Selecciona tu régimen fiscal.')
    .max(255, 'El régimen fiscal no puede superar los 255 caracteres.'),
});

export type FiscalInformationFormValues = z.infer<typeof fiscalInformationSchema>;

export const FISCAL_INFORMATION_FIELDS = [
  'rfc',
  'razonSocial',
  'regimenFiscal',
] as const;

/** `CreateStoreDto`. */
export const storeSchema = z.object({
  nombre: z
    .string()
    .min(1, 'Ingresa el nombre de tu tienda.')
    .max(255, 'El nombre no puede superar los 255 caracteres.'),
  descripcion: z
    .string()
    .max(1000, 'La descripción no puede superar los 1000 caracteres.')
    .optional()
    .or(z.literal('')),
});

export type StoreFormValues = z.infer<typeof storeSchema>;

export const STORE_FIELDS = ['nombre', 'descripcion'] as const;

/** `CreateProductDto` — `pesoKg` tiene `@Min(0.001)`. */
export const productSchema = z.object({
  categoriaId: z.string().uuid('Selecciona una categoría.'),
  nombre: z
    .string()
    .min(1, 'Ingresa el nombre del producto.')
    .max(255, 'El nombre no puede superar los 255 caracteres.'),
  descripcion: z
    .string()
    .max(5000, 'La descripción no puede superar los 5000 caracteres.')
    .optional()
    .or(z.literal('')),
  pesoKg: z.coerce
    .number({ invalid_type_error: 'Ingresa el peso en kilogramos.' })
    .min(0.001, 'El peso debe ser mayor que cero.'),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const PRODUCT_FIELDS = [
  'categoriaId',
  'nombre',
  'descripcion',
  'pesoKg',
] as const;

/**
 * `CreateProductVariantDto` + `CreateInventoryDto`.
 *
 * El backend los recibe en dos llamadas, pero para el vendedor son un solo
 * acto —"agregar una presentación con su precio y su stock"—, así que el
 * formulario los valida juntos.
 */
export const variantSchema = z.object({
  sku: z
    .string()
    .min(1, 'Ingresa el SKU.')
    .max(100, 'El SKU no puede superar los 100 caracteres.'),
  precio: z.coerce
    .number({ invalid_type_error: 'Ingresa el precio.' })
    .positive('El precio debe ser mayor que cero.'),
  pesoKg: z.coerce
    .number({ invalid_type_error: 'El peso debe ser un número.' })
    .positive('El peso debe ser mayor que cero.')
    .optional(),
  /** `@ArrayMinSize(1)`: el backend exige al menos un valor de atributo. */
  valorAtributoIds: z
    .array(z.string().uuid())
    .min(1, 'Selecciona al menos un atributo que distinga esta variante.'),
  stockDisponible: z.coerce
    .number({ invalid_type_error: 'Ingresa el stock disponible.' })
    .int('El stock debe ser un número entero.')
    .min(0, 'El stock no puede ser negativo.'),
  stockMinimo: z.coerce
    .number({ invalid_type_error: 'Ingresa el stock mínimo.' })
    .int('El stock mínimo debe ser un número entero.')
    .min(0, 'El stock mínimo no puede ser negativo.'),
});

export type VariantFormValues = z.infer<typeof variantSchema>;

export const VARIANT_FIELDS = [
  'sku',
  'precio',
  'pesoKg',
  'valorAtributoIds',
  'stockDisponible',
  'stockMinimo',
] as const;

/** Solo el stock, para editarlo desde la tabla de variantes. */
export const inventorySchema = z.object({
  stockDisponible: z.coerce
    .number({ invalid_type_error: 'Ingresa el stock disponible.' })
    .int('El stock debe ser un número entero.')
    .min(0, 'El stock no puede ser negativo.'),
  stockMinimo: z.coerce
    .number({ invalid_type_error: 'Ingresa el stock mínimo.' })
    .int('El stock mínimo debe ser un número entero.')
    .min(0, 'El stock mínimo no puede ser negativo.'),
});

export type InventoryFormValues = z.infer<typeof inventorySchema>;
