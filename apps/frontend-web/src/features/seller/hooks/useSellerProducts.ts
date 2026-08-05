import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { sellerCatalogApi } from '@/services/api/seller-catalog.api';
import { ApiError, NetworkError } from '@/services/http';
import type {
  CreateProductRequest,
  CreateVariantRequest,
  InventoryRequest,
} from '@/types/seller';

import { sellerKeys } from './useSellerOnboarding';

/** Categorías y atributos son taxonomía estable: se cachean con holgura. */
const TAXONOMY_STALE_TIME = 10 * 60 * 1000;

export function useCategories() {
  return useQuery({
    queryKey: sellerKeys.categories(),
    queryFn: () => sellerCatalogApi.listCategories(),
    staleTime: TAXONOMY_STALE_TIME,
  });
}

export function useAttributes() {
  return useQuery({
    queryKey: sellerKeys.attributes(),
    queryFn: () => sellerCatalogApi.listAttributes(),
    staleTime: TAXONOMY_STALE_TIME,
  });
}

export function useAttributeValues(attributeId: string | undefined) {
  return useQuery({
    queryKey: sellerKeys.attributeValues(attributeId ?? ''),
    queryFn: () => sellerCatalogApi.listAttributeValues(attributeId!),
    enabled: Boolean(attributeId),
    staleTime: TAXONOMY_STALE_TIME,
  });
}

/**
 * "Mis productos" — `GET /seller/products`.
 *
 * `enabled` debe reflejar si el vendedor ya tiene tienda: sin ella el endpoint
 * responde 404 y, al no reintentarse, la lista se quedaría vacía aun después de
 * crearla. Condicionarla hace que arranque sola en cuanto la tienda existe.
 */
export function useSellerProducts(
  page: number,
  limit: number,
  search: string,
  enabled = true,
) {
  const query = useQuery({
    queryKey: sellerKeys.productList(page, limit, search),
    queryFn: () => sellerCatalogApi.listProducts(page, limit, search || undefined),
    enabled,
    placeholderData: (previous) => previous,
    retry: false,
  });

  // 404 aquí significa que el usuario todavía no tiene tienda, no un fallo.
  const sinTienda = query.error instanceof ApiError && query.error.isNotFound;

  return { ...query, sinTienda, fallo: query.isError && !sinTienda };
}

export function useSellerProduct(productId: string | undefined) {
  return useQuery({
    queryKey: sellerKeys.product(productId ?? ''),
    queryFn: () => sellerCatalogApi.getProduct(productId!),
    enabled: Boolean(productId),
    retry: false,
  });
}

function mensajeDeError(error: unknown, generico: string): string {
  if (error instanceof NetworkError) return error.message;
  if (error instanceof ApiError) return error.message;

  return generico;
}

/**
 * Invalida el catálogo del vendedor tras cualquier cambio.
 *
 * Se invalida la rama entera de productos porque una variante nueva o un
 * cambio de stock alteran también los agregados de la lista (`precioDesde`,
 * `stockTotal`, `totalVariantes`), y esos los calcula el backend.
 */
function useRefreshProducts() {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: sellerKeys.products() });
}

export function useCreateProduct() {
  const refresh = useRefreshProducts();

  return useMutation({
    mutationFn: (body: CreateProductRequest) => sellerCatalogApi.createProduct(body),
    onSuccess: () => refresh(),
    onError: (error) =>
      toast.error(mensajeDeError(error, 'No pudimos crear el producto.')),
  });
}

/**
 * Alta de una variante con su inventario.
 *
 * Son dos llamadas seguidas y el backend no las agrupa en una transacción: si
 * el inventario falla, la variante queda creada sin stock. Se avisa con ese
 * matiz para que el vendedor sepa qué quedó a medias, en vez de dar el alta
 * por fallida entera.
 */
export function useCreateVariant(productId: string | undefined) {
  const refresh = useRefreshProducts();

  return useMutation({
    mutationFn: async ({
      variante,
      inventario,
    }: {
      variante: CreateVariantRequest;
      inventario: InventoryRequest;
    }) => {
      const creada = await sellerCatalogApi.createVariant(productId!, variante);

      try {
        await sellerCatalogApi.createInventory(creada.id, inventario);
      } catch (error) {
        throw new VariantWithoutInventoryError(creada.sku, error);
      }

      return creada;
    },

    onSuccess: () => {
      refresh();
      toast.success('Variante agregada.');
    },

    onError: (error) => {
      if (error instanceof VariantWithoutInventoryError) {
        refresh();
        toast.warning(
          `La variante ${error.sku} se creó, pero no pudimos registrar su inventario. Edítalo desde la lista de variantes.`,
        );
        return;
      }

      toast.error(mensajeDeError(error, 'No pudimos agregar la variante.'));
    },
  });
}

/** La variante se creó pero su inventario no. */
class VariantWithoutInventoryError extends Error {
  readonly sku: string;

  constructor(sku: string, cause: unknown) {
    super('La variante se creó sin inventario.');
    this.name = 'VariantWithoutInventoryError';
    this.sku = sku;
    this.cause = cause;
  }
}

/**
 * Ajuste de stock. `POST` si la variante aún no tiene inventario y `PATCH` si
 * ya lo tiene: el backend responde 409 al crear uno que ya existe.
 */
export function useUpdateInventory() {
  const refresh = useRefreshProducts();

  return useMutation({
    mutationFn: ({
      variantId,
      body,
      existe,
    }: {
      variantId: string;
      body: InventoryRequest;
      existe: boolean;
    }) =>
      existe
        ? sellerCatalogApi.updateInventory(variantId, body)
        : sellerCatalogApi.createInventory(variantId, body),

    onSuccess: () => {
      refresh();
      toast.success('Inventario actualizado.');
    },

    onError: (error) =>
      toast.error(mensajeDeError(error, 'No pudimos actualizar el inventario.')),
  });
}

/**
 * Publicar o retirar de publicación.
 *
 * Publicar exige que el producto sea comprable; el backend responde 409
 * explicando cuál de las tres condiciones falla —sin variante activa, sin
 * inventario o sin stock— y ese mensaje se muestra literal.
 */
export function useUpdatePublication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, publicado }: { productId: string; publicado: boolean }) =>
      sellerCatalogApi.updatePublication(productId, publicado),

    onSuccess: (producto) => {
      queryClient.setQueryData(sellerKeys.product(producto.id), producto);
      queryClient.invalidateQueries({
        queryKey: sellerKeys.products(),
        predicate: (query) => query.queryKey[2] === 'list',
      });

      toast.success(
        producto.publicado
          ? `"${producto.nombre}" ya está publicado.`
          : `"${producto.nombre}" se retiró del catálogo.`,
      );
    },

    onError: (error) =>
      toast.error(mensajeDeError(error, 'No pudimos cambiar la publicación.')),
  });
}

export function useUploadProductImage(productId: string | undefined) {
  const refresh = useRefreshProducts();

  return useMutation({
    mutationFn: (file: File) => sellerCatalogApi.uploadImage(productId!, file),

    onSuccess: () => {
      refresh();
      toast.success('Imagen cargada.');
    },

    onError: (error) => toast.error(mensajeDeError(error, 'No pudimos cargar la imagen.')),
  });
}
