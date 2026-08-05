/**
 * Contratos del catálogo.
 *
 * ⚠️ El backend **todavía no expone lectura de catálogo**: el módulo `catalog`
 * solo tiene endpoints de escritura para el vendedor. Estos tipos son el
 * contrato *propuesto*, modelado directamente sobre el esquema de Prisma
 * (`Producto`, `ProductoVariante`, `Inventario`, `ProductoImagen`, `Categoria`,
 * `Tienda`) para que, cuando los endpoints existan, la única pieza que cambie
 * sea la implementación de `services/api/catalog.api.ts`.
 *
 * Ver `PENDING_INTEGRATIONS.md`, sección 1.
 */

/** Espejo de `Categoria`. `productCount` es un agregado que debería calcular el backend. */
export interface CategoryDto {
  id: string;
  parentId: string | null;
  nombre: string;
  slug: string;
  descripcion: string | null;
  productCount: number;
}

/** Espejo de `ProductoImagen`. */
export interface ProductImageDto {
  id: string;
  url: string;
  orden: number;
  esPrincipal: boolean;
}

/** Par atributo/valor de una variante (`Atributo` + `ValorAtributo`). */
export interface ProductVariantAttributeDto {
  atributo: string;
  valor: string;
}

/**
 * Espejo de `ProductoVariante` + su `Inventario`.
 *
 * `id` es el `productoVarianteId` que exige `POST /cart/items`: es el único
 * identificador que conecta el catálogo con el carrito.
 */
export interface ProductVariantDto {
  id: string;
  sku: string;
  precio: number;
  pesoKg: number | null;
  activa: boolean;
  stockDisponible: number;
  atributos: ProductVariantAttributeDto[];
}

/** Datos de la tienda que publica el producto (`Tienda` + `Vendedor`). */
export interface ProductStoreDto {
  id: string;
  vendedorId: string;
  codigoPublico: string;
  nombre: string;
  logoUrl: string | null;
}

/**
 * Campos que el diseño de Figma muestra pero que **no existen en el esquema**.
 * Se declaran opcionales para que la interfaz degrade sin romperse si el
 * backend nunca los provee. Ver `PENDING_INTEGRATIONS.md`.
 */
interface DesignOnlyFields {
  /** Precio tachado. Requeriría un modelo de promociones. */
  precioAnterior?: number;
  /** Promedio de reseñas. Requeriría un modelo de opiniones. */
  calificacion?: number;
  totalOpiniones?: number;
  /** Etiqueta de la esquina: "-22%", "Nuevo", "Más vendido". */
  etiqueta?: string;
  /** Hoy el envío lo cotiza Checkout por vendedor, no el producto. */
  envioGratis?: boolean;
  /** Contador de ventas del detalle de producto. */
  unidadesVendidas?: number;
}

/** Producto tal como aparece en una rejilla o carrusel. */
export interface ProductListItemDto extends DesignOnlyFields {
  id: string;
  codigoPublico: string;
  nombre: string;
  categoriaId: string;
  tienda: ProductStoreDto;
  imagenPrincipalUrl: string | null;
  /** Precio mínimo entre las variantes activas. */
  precioDesde: number;
  /** Suma del stock disponible de las variantes activas. */
  stockTotal: number;
}

/** Producto completo, con variantes e imágenes. */
export interface ProductDetailDto extends ProductListItemDto {
  descripcion: string | null;
  pesoKg: number;
  altoCm: number | null;
  anchoCm: number | null;
  largoCm: number | null;
  categoria: Pick<CategoryDto, 'id' | 'nombre' | 'slug'>;
  imagenes: ProductImageDto[];
  variantes: ProductVariantDto[];
}

export const PRODUCT_SORTS = {
  relevancia: 'Más vendidos',
  precioAsc: 'Precio: menor a mayor',
  precioDesc: 'Precio: mayor a menor',
  populares: 'Popularidad',
  recientes: 'Más recientes',
} as const;

export type ProductSort = keyof typeof PRODUCT_SORTS;

/** Query de `GET /catalog/products`. Sigue la forma de `OrderListQueryDto`. */
export interface ProductListQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoriaId?: string;
  precioMin?: number;
  precioMax?: number;
  /** Filtra a productos con `precioAnterior` (campo sin respaldo, ver arriba). */
  soloOfertas?: boolean;
  orden?: ProductSort;
}

/** Respuesta paginada, con la misma forma que `OrderListResponseDto`. */
export interface ProductListResponse {
  products: ProductListItemDto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
