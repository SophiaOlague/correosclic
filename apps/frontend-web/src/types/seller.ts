/**
 * Contratos del dominio Seller. Espejo de
 * `apps/backend/src/seller/application/dto/` y de la parte de vendedor de
 * `apps/backend/src/catalog/application/dto/`.
 *
 * El avance del onboarding lo lleva el backend en `pasoActual`: la interfaz no
 * mantiene ninguna copia de ese estado.
 */

/** Valores de `EstadoSolicitudVendedor` en Prisma. */
export const SELLER_REQUEST_STATES = ['PENDIENTE', 'APROBADA', 'RECHAZADA'] as const;

export type SellerRequestState = (typeof SELLER_REQUEST_STATES)[number];

/** Valores de `PasoSolicitudVendedor` en Prisma, en el orden real del proceso. */
export const SELLER_REQUEST_STEPS = [
  'SOLICITUD',
  'INFORMACION_FISCAL',
  'DOCUMENTOS',
  'REVISION',
  'FINALIZADA',
] as const;

export type SellerRequestStep = (typeof SELLER_REQUEST_STEPS)[number];

/** Valores de `TipoDocumentoVendedor`. Los tres son obligatorios para enviar. */
export const SELLER_DOCUMENT_TYPES = [
  'INE',
  'CONSTANCIA_SITUACION_FISCAL',
  'COMPROBANTE_DOMICILIO',
] as const;

export type SellerDocumentType = (typeof SELLER_DOCUMENT_TYPES)[number];

export interface SellerFiscalInformationDto {
  rfc: string;
  razonSocial: string;
  regimenFiscal: string;
}

export interface SellerDocumentDto {
  tipoDocumento: string;
  nombreArchivo: string;
  urlArchivo: string;
  /** ISO 8601. */
  createdAt: string;
}

/** Espejo de `SellerRequestResponseDto` — `GET /seller/requests/me`. */
export interface SellerRequestDto {
  id: string;
  estado: string;
  pasoActual: string;
  /** Motivo que dejó el revisor al rechazarla. */
  comentariosRevision: string | null;
  fechaRevision: string | null;
  createdAt: string;
  informacionFiscal: SellerFiscalInformationDto | null;
  documentos: SellerDocumentDto[];
}

/** Espejo de `SellerStoreResponseDto` — `GET /seller/store`. */
export interface SellerStoreDto {
  id: string;
  codigoPublico: string;
  nombre: string;
  descripcion: string | null;
  logoUrl: string | null;
  activa: boolean;
  createdAt: string;
}

/** Respuesta de `POST /storage/uploads`. */
export interface UploadedFileDto {
  key: string;
  url: string;
}

/* ── Catálogo del vendedor ─────────────────────────────────────────────── */

/** Espejo de `CategoryResponseDto` — `GET /catalog/categories`. */
export interface CategoryDto {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  parentId?: string;
  activa: boolean;
  createdAt: string;
}

/** Espejo de `AttributeListItemDto` — `GET /catalog/attributes`. */
export interface AttributeDto {
  id: string;
  nombre: string;
}

/** Espejo de `AttributeValueListItemDto` — `GET /catalog/attributes/:id/values`. */
export interface AttributeValueDto {
  id: string;
  valor: string;
}

/** Espejo de `SellerProductListItemDto`. */
export interface SellerProductListItemDto {
  id: string;
  codigoPublico: string;
  nombre: string;
  categoria: { id: string; nombre: string };
  imagenPrincipalUrl: string | null;
  activo: boolean;
  publicado: boolean;
  /** `min(variantes.precio)`; null si aún no tiene variantes. */
  precioDesde: number | null;
  stockTotal: number;
  totalVariantes: number;
  createdAt: string;
}

/** Espejo de `SellerProductListResponseDto`. Misma paginación que Orders. */
export interface SellerProductListResponseDto {
  products: SellerProductListItemDto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SellerProductImageDto {
  id: string;
  url: string;
  orden: number;
  esPrincipal: boolean;
}

export interface SellerVariantAttributeDto {
  atributoId: string;
  atributo: string;
  valorId: string;
  valor: string;
}

export interface SellerProductVariantDto {
  id: string;
  sku: string;
  precio: number;
  pesoKg: number | null;
  activa: boolean;
  /** null mientras la variante no tenga inventario creado. */
  stockDisponible: number | null;
  stockReservado: number | null;
  stockMinimo: number | null;
  atributos: SellerVariantAttributeDto[];
}

/** Espejo de `SellerProductDetailResponseDto`. */
export interface SellerProductDetailDto {
  id: string;
  codigoPublico: string;
  nombre: string;
  descripcion: string | null;
  pesoKg: number;
  altoCm: number | null;
  anchoCm: number | null;
  largoCm: number | null;
  activo: boolean;
  publicado: boolean;
  createdAt: string;
  categoria: { id: string; nombre: string };
  imagenes: SellerProductImageDto[];
  variantes: SellerProductVariantDto[];
}

/* ── Cuerpos de petición ───────────────────────────────────────────────── */

export interface CreateFiscalInformationRequest {
  rfc: string;
  razonSocial: string;
  regimenFiscal: string;
}

export interface UploadSellerDocumentRequest {
  tipoDocumento: SellerDocumentType;
  nombreArchivo: string;
  urlArchivo: string;
}

export interface CreateStoreRequest {
  nombre: string;
  descripcion?: string;
}

export interface CreateProductRequest {
  categoriaId: string;
  nombre: string;
  descripcion?: string;
  pesoKg: number;
}

export interface CreateVariantRequest {
  sku: string;
  precio: number;
  pesoKg?: number;
  valorAtributoIds: string[];
}

export interface InventoryRequest {
  stockDisponible: number;
  stockMinimo: number;
}

/** Espejo de `InventoryResponseDto`. */
export interface InventoryDto {
  id: string;
  productoVarianteId: string;
  stockDisponible: number;
  stockReservado: number;
  stockMinimo: number;
  createdAt: string;
}

/** Espejo de `ProductResponseDto` — respuesta de `POST /seller/products`. */
export interface CreatedProductDto {
  id: string;
  codigoPublico: string;
  nombre: string;
  descripcion?: string;
  pesoKg: number;
  activo: boolean;
  publicado: boolean;
  createdAt: string;
}

/** Espejo de `ProductVariantResponseDto`. */
export interface CreatedVariantDto {
  id: string;
  sku: string;
  precio: number;
  pesoKg?: number;
  activa: boolean;
  createdAt: string;
}
