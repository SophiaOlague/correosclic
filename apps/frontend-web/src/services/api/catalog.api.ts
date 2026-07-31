import {
  MOCK_CATEGORIES,
  MOCK_PRODUCT_CREATED_AT,
  MOCK_PRODUCTS,
  MOCK_QUESTIONS,
  MOCK_REVIEWS,
} from '@/mocks/catalog.mock';
import { ApiError } from '@/services/http';
import type {
  CategoryDto,
  ProductDetailDto,
  ProductListQuery,
  ProductListResponse,
} from '@/types/catalog';

/**
 * Única fuente de datos del catálogo.
 *
 * ⚠️ TODO: Backend integration pending — el módulo `catalog` del backend solo
 * expone escritura para el vendedor; no hay lectura pública. Mientras tanto
 * estas funciones resuelven contra `mocks/catalog.mock.ts`.
 *
 * **Cómo conectar el backend real cuando exista:** sustituir el cuerpo de las
 * tres funciones por la llamada `http.get<...>(...)` indicada en el comentario
 * de cada una. Ni los componentes, ni los hooks, ni los tipos cambian: la
 * firma y la forma de la respuesta ya son las del contrato propuesto.
 *
 * Ver `PENDING_INTEGRATIONS.md`, sección 1.
 */

/** Latencia simulada para que los estados de carga se comporten como en producción. */
const MOCK_LATENCY_MS = 320;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_LATENCY_MS));
}

export const catalogApi = {
  /**
   * Reemplazar por:
   * `return http.get<CategoryDto[]>('/catalog/categories', { skipAuth: true });`
   */
  listCategories(): Promise<CategoryDto[]> {
    return delay(MOCK_CATEGORIES);
  },

  /**
   * Reemplazar por:
   * `return http.get<ProductListResponse>('/catalog/products', { query, skipAuth: true });`
   */
  listProducts(query: ProductListQuery = {}): Promise<ProductListResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;

    let results = [...MOCK_PRODUCTS];

    if (query.search) {
      const term = query.search.trim().toLowerCase();

      results = results.filter(
        (product) =>
          product.nombre.toLowerCase().includes(term) ||
          product.tienda.nombre.toLowerCase().includes(term),
      );
    }

    if (query.categoriaId) {
      results = results.filter((product) => product.categoriaId === query.categoriaId);
    }

    if (query.precioMin !== undefined) {
      results = results.filter((product) => product.precioDesde >= query.precioMin!);
    }

    if (query.precioMax !== undefined) {
      results = results.filter((product) => product.precioDesde <= query.precioMax!);
    }

    if (query.soloOfertas) {
      results = results.filter((product) => product.precioAnterior !== undefined);
    }

    results = sortProducts(results, query.orden);

    const total = results.length;
    const start = (page - 1) * limit;

    return delay({
      products: results.slice(start, start + limit).map(toListItem),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  },

  /**
   * Reemplazar por:
   * `return http.get<ProductDetailDto>(`/catalog/products/${id}`, { skipAuth: true });`
   */
  getProductById(id: string): Promise<ProductDetailDto> {
    const product = MOCK_PRODUCTS.find((candidate) => candidate.id === id);

    if (!product) {
      // Mismo error que produciría un 404 del backend, para que la interfaz
      // ejercite la ruta de "producto no encontrado" desde ahora.
      return Promise.reject(new ApiError(404, ['No encontramos el producto que buscas.']));
    }

    return delay(product);
  },

  /**
   * Opiniones del producto. No existe modelo de reseñas en Prisma.
   * TODO: Backend integration pending — ver PENDING_INTEGRATIONS.md.
   */
  listReviews(_productId: string) {
    return delay(MOCK_REVIEWS);
  },

  /**
   * Preguntas y respuestas del producto. Tampoco existe en el esquema.
   * TODO: Backend integration pending — ver PENDING_INTEGRATIONS.md.
   */
  listQuestions(_productId: string) {
    return delay(MOCK_QUESTIONS);
  },
};

function toListItem(product: ProductDetailDto) {
  // El listado no debe arrastrar variantes ni descripción: se devuelve
  // exactamente lo que `ProductListItemDto` declara.
  const {
    descripcion: _descripcion,
    pesoKg: _pesoKg,
    altoCm: _altoCm,
    anchoCm: _anchoCm,
    largoCm: _largoCm,
    categoria: _categoria,
    imagenes: _imagenes,
    variantes: _variantes,
    ...listItem
  } = product;

  return listItem;
}

function sortProducts(
  products: ProductDetailDto[],
  orden: ProductListQuery['orden'],
): ProductDetailDto[] {
  switch (orden) {
    case 'precioAsc':
      return products.sort((a, b) => a.precioDesde - b.precioDesde);

    case 'precioDesc':
      return products.sort((a, b) => b.precioDesde - a.precioDesde);

    case 'recientes':
      return products.sort(
        (a, b) =>
          Date.parse(MOCK_PRODUCT_CREATED_AT.get(b.id) ?? '') -
          Date.parse(MOCK_PRODUCT_CREATED_AT.get(a.id) ?? ''),
      );

    case 'populares':
      return products.sort((a, b) => (b.totalOpiniones ?? 0) - (a.totalOpiniones ?? 0));

    case 'relevancia':
    default:
      return products.sort((a, b) => (b.unidadesVendidas ?? 0) - (a.unidadesVendidas ?? 0));
  }
}
