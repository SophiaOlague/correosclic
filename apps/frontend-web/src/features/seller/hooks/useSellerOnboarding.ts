import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { sellerApi } from '@/services/api/seller.api';
import { ApiError, NetworkError } from '@/services/http';
import type {
  CreateFiscalInformationRequest,
  CreateStoreRequest,
  SellerDocumentType,
} from '@/types/seller';

export const sellerKeys = {
  all: ['seller'] as const,
  request: () => [...sellerKeys.all, 'request'] as const,
  store: () => [...sellerKeys.all, 'store'] as const,
  products: () => [...sellerKeys.all, 'products'] as const,
  productList: (page: number, limit: number, search: string) =>
    [...sellerKeys.products(), 'list', page, limit, search] as const,
  product: (productId: string) => [...sellerKeys.products(), 'detail', productId] as const,
  categories: () => [...sellerKeys.all, 'categories'] as const,
  attributes: () => [...sellerKeys.all, 'attributes'] as const,
  attributeValues: (attributeId: string) =>
    [...sellerKeys.attributes(), attributeId, 'values'] as const,
};

/**
 * Solicitud vigente — `GET /seller/requests/me`.
 *
 * Es la única fuente del avance del onboarding. El 404 no es un error: indica
 * que el usuario todavía no ha iniciado ninguna solicitud, así que no se
 * reintenta ni se muestra como fallo.
 */
export function useSellerRequest() {
  const query = useQuery({
    queryKey: sellerKeys.request(),
    queryFn: () => sellerApi.getMyRequest(),
    retry: false,
  });

  const sinSolicitud = query.error instanceof ApiError && query.error.isNotFound;

  return {
    ...query,
    sinSolicitud,
    /** Un error de verdad, no el 404 de "aún no ha solicitado". */
    fallo: query.isError && !sinSolicitud,
  };
}

/** Tienda del vendedor — `GET /seller/store`. Mismo criterio con el 404. */
export function useSellerStore(enabled = true) {
  const query = useQuery({
    queryKey: sellerKeys.store(),
    queryFn: () => sellerApi.getMyStore(),
    enabled,
    retry: false,
  });

  const sinTienda = query.error instanceof ApiError && query.error.isNotFound;

  return {
    ...query,
    sinTienda,
    fallo: query.isError && !sinTienda,
  };
}

/** Mensaje de error legible para cualquier fallo de una mutación de Seller. */
function mensajeDeError(error: unknown, generico: string): string {
  if (error instanceof NetworkError) return error.message;
  if (error instanceof ApiError) return error.message;

  return generico;
}

/**
 * Cada mutación invalida la solicitud y deja que el backend diga en qué paso
 * quedó. No se mantiene ninguna copia local del avance.
 */
function useRefreshRequest() {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: sellerKeys.request() });
}

/** `POST /seller/requests` — inicia el proceso. */
export function useCreateSellerRequest() {
  const refresh = useRefreshRequest();

  return useMutation({
    mutationFn: () => sellerApi.createRequest(),
    onSuccess: () => refresh(),
    onError: (error) =>
      toast.error(mensajeDeError(error, 'No pudimos iniciar tu solicitud.')),
  });
}

/** `POST /seller/requests/:id/fiscal-information`. */
export function useAddFiscalInformation(requestId: string | undefined) {
  const refresh = useRefreshRequest();

  return useMutation({
    mutationFn: (body: CreateFiscalInformationRequest) =>
      sellerApi.addFiscalInformation(requestId!, body),

    onSuccess: () => {
      refresh();
      toast.success('Información fiscal registrada.');
    },

    onError: (error) =>
      toast.error(mensajeDeError(error, 'No pudimos guardar tu información fiscal.')),
  });
}

/**
 * Subida de un documento: primero el archivo a R2, después el registro.
 *
 * Son dos peticiones y el backend no las agrupa. Si la segunda falla, el
 * archivo queda subido pero sin registrar; se avisa y el vendedor puede
 * reintentar, que es lo mismo que subirlo de nuevo.
 */
export function useUploadSellerDocument(requestId: string | undefined) {
  const refresh = useRefreshRequest();

  return useMutation({
    mutationFn: async ({
      tipoDocumento,
      file,
    }: {
      tipoDocumento: SellerDocumentType;
      file: File;
    }) => {
      const uploaded = await sellerApi.uploadFile(file);

      return sellerApi.addDocument(requestId!, {
        tipoDocumento,
        nombreArchivo: file.name,
        urlArchivo: uploaded.url,
      });
    },

    onSuccess: () => {
      refresh();
      toast.success('Documento cargado.');
    },

    onError: (error) =>
      toast.error(mensajeDeError(error, 'No pudimos cargar el documento.')),
  });
}

/**
 * `PATCH /seller/requests/:id/submit`.
 *
 * El backend revalida que estén la información fiscal y los tres documentos, y
 * responde 409 diciendo exactamente cuál falta. Ese mensaje se muestra tal cual.
 */
export function useSubmitSellerRequest(requestId: string | undefined) {
  const refresh = useRefreshRequest();

  return useMutation({
    mutationFn: () => sellerApi.submitRequest(requestId!),

    onSuccess: () => {
      refresh();
      toast.success('Solicitud enviada a revisión.');
    },

    onError: (error) =>
      toast.error(mensajeDeError(error, 'No pudimos enviar tu solicitud.')),
  });
}

/** `POST /seller/store` — solo tras la aprobación. */
export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateStoreRequest) => sellerApi.createStore(body),

    onSuccess: (store) => {
      // El endpoint devuelve la tienda completa: se escribe en caché en vez de
      // releerla.
      queryClient.setQueryData(sellerKeys.store(), store);
      toast.success(`Tienda "${store.nombre}" creada.`);
    },

    onError: (error) =>
      toast.error(mensajeDeError(error, 'No pudimos crear tu tienda.')),
  });
}
