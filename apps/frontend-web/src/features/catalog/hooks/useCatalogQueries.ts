import { useQuery } from '@tanstack/react-query';

import { catalogApi } from '@/services/api/catalog.api';
import type { ProductListQuery } from '@/types/catalog';

/**
 * Claves de caché del catálogo. Centralizadas para poder invalidar por rama
 * (`catalogKeys.products()` alcanza a todos los listados con cualquier filtro).
 */
export const catalogKeys = {
  all: ['catalog'] as const,
  categories: () => [...catalogKeys.all, 'categories'] as const,
  products: () => [...catalogKeys.all, 'products'] as const,
  productList: (query: ProductListQuery) => [...catalogKeys.products(), query] as const,
  product: (id: string) => [...catalogKeys.all, 'product', id] as const,
  reviews: (id: string) => [...catalogKeys.product(id), 'reviews'] as const,
  questions: (id: string) => [...catalogKeys.product(id), 'questions'] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: () => catalogApi.listCategories(),
    // Las categorías cambian con muy poca frecuencia.
    staleTime: 10 * 60_000,
  });
}

export function useProducts(query: ProductListQuery = {}) {
  return useQuery({
    queryKey: catalogKeys.productList(query),
    queryFn: () => catalogApi.listProducts(query),
    // Mantener la página anterior visible evita el parpadeo al paginar.
    placeholderData: (previous) => previous,
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: catalogKeys.product(id ?? ''),
    queryFn: () => catalogApi.getProductById(id!),
    enabled: Boolean(id),
  });
}

export function useProductReviews(id: string | undefined) {
  return useQuery({
    queryKey: catalogKeys.reviews(id ?? ''),
    queryFn: () => catalogApi.listReviews(id!),
    enabled: Boolean(id),
  });
}

export function useProductQuestions(id: string | undefined) {
  return useQuery({
    queryKey: catalogKeys.questions(id ?? ''),
    queryFn: () => catalogApi.listQuestions(id!),
    enabled: Boolean(id),
  });
}
