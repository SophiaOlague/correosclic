import { http } from '@/services/http';
import type {
  AttributeDto,
  AttributeValueDto,
  CategoryDto,
  CreateProductRequest,
  CreateVariantRequest,
  CreatedProductDto,
  CreatedVariantDto,
  InventoryDto,
  InventoryRequest,
  SellerProductDetailDto,
  SellerProductListResponseDto,
} from '@/types/seller';

/**
 * Catálogo del vendedor
 * (`apps/backend/src/catalog/controllers/product.controller.ts`).
 *
 * Todo se acota a la tienda del vendedor autenticado: el backend resuelve la
 * `Tienda` a partir del usuario y responde 404 ante un producto o variante que
 * no le pertenezca.
 *
 * **Dar de alta un producto son varias llamadas y el backend no las envuelve
 * en una transacción**: producto → variante → inventario → imágenes. Si una
 * falla, lo anterior queda creado. Por eso la interfaz lo presenta como un
 * proceso por pasos reanudable y no como un único "Guardar".
 */
export const sellerCatalogApi = {
  /* ── Taxonomía (lectura pública) ─────────────────────────────────────── */

  /** `GET /catalog/categories` — categorías activas. */
  listCategories(): Promise<CategoryDto[]> {
    return http.get<CategoryDto[]>('/catalog/categories');
  },

  /** `GET /catalog/attributes` */
  listAttributes(): Promise<AttributeDto[]> {
    return http.get<AttributeDto[]>('/catalog/attributes');
  },

  /** `GET /catalog/attributes/:id/values` */
  listAttributeValues(attributeId: string): Promise<AttributeValueDto[]> {
    return http.get<AttributeValueDto[]>(`/catalog/attributes/${attributeId}/values`);
  },

  /* ── Productos ───────────────────────────────────────────────────────── */

  /** `GET /seller/products?page&limit&search` — `limit` máximo 100. */
  listProducts(
    page: number,
    limit: number,
    search?: string,
  ): Promise<SellerProductListResponseDto> {
    return http.get<SellerProductListResponseDto>('/seller/products', {
      query: { page, limit, search },
    });
  },

  /** `GET /seller/products/:id` — con variantes, stock, atributos e imágenes. */
  getProduct(productId: string): Promise<SellerProductDetailDto> {
    return http.get<SellerProductDetailDto>(`/seller/products/${productId}`);
  },

  /** `POST /seller/products` — exige tener tienda registrada. */
  createProduct(body: CreateProductRequest): Promise<CreatedProductDto> {
    return http.post<CreatedProductDto>('/seller/products', body);
  },

  /**
   * `PATCH /seller/products/:id/publication`
   *
   * Publicar exige que el producto sea comprable —al menos una variante activa
   * con inventario y stock disponible—; si no, responde 409 explicando cuál de
   * las tres condiciones falla. Retirar de publicación nunca se bloquea.
   */
  updatePublication(
    productId: string,
    publicado: boolean,
  ): Promise<SellerProductDetailDto> {
    return http.patch<SellerProductDetailDto>(
      `/seller/products/${productId}/publication`,
      { publicado },
    );
  },

  /** `POST /seller/products/:productId/images` — multipart, máximo 10 por producto. */
  uploadImage(productId: string, file: File): Promise<unknown> {
    const body = new FormData();
    body.append('file', file);

    return http.post(`/seller/products/${productId}/images`, body);
  },

  /* ── Variantes e inventario ──────────────────────────────────────────── */

  /** `POST /seller/products/:id/variants` — el SKU se normaliza a mayúsculas y debe ser único. */
  createVariant(
    productId: string,
    body: CreateVariantRequest,
  ): Promise<CreatedVariantDto> {
    return http.post<CreatedVariantDto>(`/seller/products/${productId}/variants`, body);
  },

  /** `POST /seller/products/variants/:id/inventory` — 409 si la variante ya tiene inventario. */
  createInventory(variantId: string, body: InventoryRequest): Promise<InventoryDto> {
    return http.post<InventoryDto>(
      `/seller/products/variants/${variantId}/inventory`,
      body,
    );
  },

  /** `PATCH /seller/products/variants/:id/inventory` */
  updateInventory(variantId: string, body: InventoryRequest): Promise<InventoryDto> {
    return http.patch<InventoryDto>(
      `/seller/products/variants/${variantId}/inventory`,
      body,
    );
  },
};
