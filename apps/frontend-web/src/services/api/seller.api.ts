import { http } from '@/services/http';
import type {
  CreateFiscalInformationRequest,
  CreateStoreRequest,
  SellerRequestDto,
  SellerStoreDto,
  UploadSellerDocumentRequest,
  UploadedFileDto,
} from '@/types/seller';

/**
 * Onboarding de vendedor
 * (`apps/backend/src/seller/controllers/seller-onboarding.controller.ts`).
 *
 * Todas las operaciones sobre una solicitud se acotan a su dueño: el backend
 * resuelve el `Cliente` del usuario autenticado y responde **404** si la
 * solicitud es de otra persona, igual que Orders y Logistics.
 */
export const sellerApi = {
  /**
   * `GET /seller/requests/me` — solicitud vigente (la más reciente).
   *
   * Es la única fuente del avance del proceso: `pasoActual` lo escribe el
   * backend al registrar la información fiscal y los documentos. El 404 es
   * esperable y significa "todavía no ha solicitado nada", no un fallo.
   */
  getMyRequest(): Promise<SellerRequestDto> {
    return http.get<SellerRequestDto>('/seller/requests/me');
  },

  /** `POST /seller/requests` — 409 si ya hay una solicitud pendiente. */
  createRequest(): Promise<{ id: string }> {
    return http.post<{ id: string }>('/seller/requests');
  },

  /** `POST /seller/requests/:id/fiscal-information` — 409 si ya se registró. */
  addFiscalInformation(
    requestId: string,
    body: CreateFiscalInformationRequest,
  ): Promise<unknown> {
    return http.post(`/seller/requests/${requestId}/fiscal-information`, body);
  },

  /**
   * `POST /seller/requests/:id/documents`
   *
   * El backend guarda una URL, no el archivo: primero se sube con
   * `uploadFile` y aquí se registra el resultado. Responde 409 si ya existe un
   * documento de ese tipo.
   */
  addDocument(
    requestId: string,
    body: UploadSellerDocumentRequest,
  ): Promise<unknown> {
    return http.post(`/seller/requests/${requestId}/documents`, body);
  },

  /**
   * `PATCH /seller/requests/:id/submit`
   *
   * Revalida en el servidor que estén la información fiscal y los tres
   * documentos; responde 409 detallando qué falta.
   */
  submitRequest(requestId: string): Promise<unknown> {
    return http.patch(`/seller/requests/${requestId}/submit`);
  },

  /** `GET /seller/store` — 404 mientras no sea vendedor aprobado o no la haya creado. */
  getMyStore(): Promise<SellerStoreDto> {
    return http.get<SellerStoreDto>('/seller/store');
  },

  /** `POST /seller/store` — exige ser vendedor aprobado; 409 si ya tiene tienda. */
  createStore(body: CreateStoreRequest): Promise<SellerStoreDto> {
    return http.post<SellerStoreDto>('/seller/store', body);
  },

  /**
   * `POST /storage/uploads` — multipart, exige sesión.
   *
   * Devuelve `{ key, url }`; la `url` es la que viaja luego en el documento.
   * Acepta JPEG, PNG, WEBP y PDF, hasta 5 MB.
   */
  uploadFile(file: File): Promise<UploadedFileDto> {
    const body = new FormData();
    body.append('file', file);

    return http.post<UploadedFileDto>('/storage/uploads', body);
  },
};
