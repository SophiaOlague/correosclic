import { http } from '@/services/http';
import type {
  AdminBranchDto,
  AdminVehicleDto,
  ApproveSellerRequestRequest,
  OperatingStateDto,
  PendingSellerRequestDto,
  RejectSellerRequestRequest,
  ResolvedSellerRequestDto,
  SellerRequestDetailDto,
  SystemConfigEntryDto,
  UpdateSystemConfigRequest,
} from '@/types/admin';

/**
 * Panel administrativo
 * (`apps/backend/src/admin/controllers/admin-seller.controller.ts` y
 * `admin-operations.controller.ts`).
 *
 * Los nueve endpoints llevan `JwtAuthGuard + RolesGuard` con
 * `@Roles(SUPER_ADMIN)`, así que cualquier otro rol —incluidos
 * `ADMIN_REGIONAL` y `ADMIN_LOCAL`— recibe 403. Es una decisión de menor
 * privilegio del backend, no un olvido.
 *
 * Este es el único lugar de la aplicación con llamadas HTTP a `admin/`.
 */
export const adminApi = {
  /**
   * `GET /admin/seller-requests` — cola de revisión.
   *
   * Devuelve únicamente las solicitudes `PENDIENTE` que además están en el
   * paso `REVISION`, es decir, las que el solicitante ya envió. Sin paginación:
   * el backend no la ofrece.
   */
  listSellerRequests(): Promise<PendingSellerRequestDto[]> {
    return http.get<PendingSellerRequestDto[]>('/admin/seller-requests');
  },

  /** `GET /admin/seller-requests/:id` — 404 si no existe. */
  getSellerRequest(id: string): Promise<SellerRequestDetailDto> {
    return http.get<SellerRequestDetailDto>(`/admin/seller-requests/${id}`);
  },

  /**
   * `GET /admin/operating-states` — alimenta el selector de la aprobación.
   *
   * El backend ya filtra por `activo` y por tener latitud y longitud, así que
   * todo lo que llega aquí es apto para el motor logístico.
   */
  listOperatingStates(): Promise<OperatingStateDto[]> {
    return http.get<OperatingStateDto[]>('/admin/operating-states');
  },

  /**
   * `PATCH /admin/seller-requests/:id/approve`
   *
   * `estadoOperacionId` es obligatorio: crea el `Vendedor` con sus coordenadas
   * de origen. Sin él, `ShipmentCreationService` abandona la creación del envío
   * con un aviso en el log y el cliente paga sin recibir guía. El backend
   * revalida que el estado exista, esté activo y tenga coordenadas (400), y
   * responde 409 si la solicitud ya fue revisada.
   */
  approveSellerRequest(
    id: string,
    body: ApproveSellerRequestRequest,
  ): Promise<ResolvedSellerRequestDto> {
    return http.patch<ResolvedSellerRequestDto>(
      `/admin/seller-requests/${id}/approve`,
      body,
    );
  },

  /**
   * `PATCH /admin/seller-requests/:id/reject`
   *
   * `comentariosRevision` es obligatorio (máx. 500) y es lo que el solicitante
   * ve en `GET /seller/requests/me` tras el rechazo.
   */
  rejectSellerRequest(
    id: string,
    body: RejectSellerRequestRequest,
  ): Promise<ResolvedSellerRequestDto> {
    return http.patch<ResolvedSellerRequestDto>(
      `/admin/seller-requests/${id}/reject`,
      body,
    );
  },

  /** `GET /admin/branches` — solo lectura; no hay alta ni edición. */
  listBranches(): Promise<AdminBranchDto[]> {
    return http.get<AdminBranchDto[]>('/admin/branches');
  },

  /** `GET /admin/vehicles` — solo lectura; no hay alta ni edición. */
  listVehicles(): Promise<AdminVehicleDto[]> {
    return http.get<AdminVehicleDto[]>('/admin/vehicles');
  },

  /** `GET /admin/system-config` — solo las claves de `ConfiguracionSistemaKey`. */
  listSystemConfig(): Promise<SystemConfigEntryDto[]> {
    return http.get<SystemConfigEntryDto[]>('/admin/system-config');
  },

  /**
   * `PATCH /admin/system-config/:clave` — devuelve la entrada ya actualizada.
   *
   * El valor viaja siempre como texto: la columna es `VarChar(255)` y cada
   * consumidor lo interpreta (`getNumber`). Una clave fuera del dominio
   * responde 404.
   */
  updateSystemConfig(
    clave: string,
    body: UpdateSystemConfigRequest,
  ): Promise<SystemConfigEntryDto> {
    return http.patch<SystemConfigEntryDto>(`/admin/system-config/${clave}`, body);
  },
};
