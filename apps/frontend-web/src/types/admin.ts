/**
 * Contratos del dominio Admin. Espejo de
 * `apps/backend/src/admin/application/dto/`.
 *
 * Los nueve endpoints de `admin/` exigen rol `SUPER_ADMIN`
 * (`@Roles(ROLES.SUPER_ADMIN)` en ambos controladores). No hay jerarquía: un
 * `ADMIN_REGIONAL` o un `ADMIN_LOCAL` reciben 403.
 *
 * Las fechas viajan serializadas como cadenas ISO 8601 aunque el DTO del
 * backend las declare `Date`.
 */

/* ── Solicitudes de vendedor ───────────────────────────────────────────── */

/**
 * Espejo de `PendingSellerRequestResponseDto` — `GET /admin/seller-requests`.
 *
 * La cola solo trae solicitudes en `estado = PENDIENTE` y
 * `pasoActual = REVISION`, es decir, las que su dueño ya envió con
 * `PATCH /seller/requests/:id/submit`. Las que siguen a medio llenar no
 * aparecen.
 */
export interface PendingSellerRequestDto {
  id: string;
  nombreCompleto: string;
  /** Cadena vacía si la solicitud aún no registró información fiscal. */
  rfc: string;
  fechaSolicitud: string;
  /** El backend lo calcula como `documentos.length === 3`. */
  documentosCompletos: boolean;
}

export interface AdminFiscalInformationDto {
  rfc: string;
  razonSocial: string;
  regimenFiscal: string;
}

export interface AdminRequestDocumentDto {
  tipoDocumento: string;
  nombreArchivo: string;
  urlArchivo: string;
}

/** Espejo de `SellerRequestDetailResponseDto` — `GET /admin/seller-requests/:id`. */
export interface SellerRequestDetailDto {
  id: string;
  /** `EstadoSolicitudVendedor`: PENDIENTE | APROBADA | RECHAZADA. */
  estado: string;
  /** `PasoSolicitudVendedor`. La cola filtra por `REVISION`. */
  pasoActual: string;
  cliente: {
    nombreCompleto: string;
    email: string;
    telefono?: string;
  };
  informacionFiscal: AdminFiscalInformationDto | null;
  documentos: AdminRequestDocumentDto[];
}

/**
 * Espejo de `findOperatingStates` — `GET /admin/operating-states`.
 *
 * Solo llegan los estados activos **y con coordenadas**: son los únicos con
 * los que `ShipmentCreationService` puede resolver la sucursal de origen de un
 * envío. `codigo` y `region` son nulos en el esquema.
 */
export interface OperatingStateDto {
  id: string;
  nombre: string;
  codigo: string | null;
  region: { id: string; nombre: string } | null;
}

/**
 * Respuesta de `approve` y `reject`: el registro `SolicitudVendedor`
 * actualizado, sin DTO intermedio. Solo se declaran los campos que la interfaz
 * usa para confirmar el resultado.
 */
export interface ResolvedSellerRequestDto {
  id: string;
  estado: string;
  pasoActual: string;
  comentariosRevision: string | null;
  fechaRevision: string | null;
}

/* ── Red operativa ─────────────────────────────────────────────────────── */

/** Espejo de `AdminBranchDto` — `GET /admin/branches`. */
export interface AdminBranchDto {
  id: string;
  codigo: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  activa: boolean;
  direccionFormateada: string | null;
  ciudad: string;
  estado: string;
  totalEmpleados: number;
  totalVehiculos: number;
}

/** Espejo de `AdminVehicleDto` — `GET /admin/vehicles`. */
export interface AdminVehicleDto {
  id: string;
  placas: string;
  marca: string;
  modelo: string;
  anio: number;
  capacidadKg: number;
  activo: boolean;
  sucursal: { id: string; nombre: string };
  /** Repartidor con la asignación vigente; null si el vehículo está libre. */
  repartidorAsignado: string | null;
}

/* ── Configuración del sistema ─────────────────────────────────────────── */

/**
 * Claves que el backend declara en `ConfiguracionSistemaKey` y las únicas que
 * `GET /admin/system-config` devuelve y `PATCH /admin/system-config/:clave`
 * acepta: cualquier otra responde 404.
 */
export const SYSTEM_CONFIG_KEYS = [
  'MARKETPLACE_COMMISSION',
  'IVA_PERCENTAGE',
  'CURRENCY',
  'PAYMENT_TIMEOUT_MINUTES',
  'VOLUMETRIC_FACTOR',
  'ADDITIONAL_VENDOR_SHIPPING_FACTOR',
  'MAX_DELIVERY_ATTEMPTS',
] as const;

export type SystemConfigKey = (typeof SYSTEM_CONFIG_KEYS)[number];

/** Espejo de `SystemConfigEntryDto`. `valor` siempre es texto: `VarChar(255)`. */
export interface SystemConfigEntryDto {
  clave: string;
  valor: string;
  descripcion: string | null;
  updatedAt: string;
}

/* ── Cuerpos de petición ───────────────────────────────────────────────── */

export interface ApproveSellerRequestRequest {
  estadoOperacionId: string;
}

export interface RejectSellerRequestRequest {
  comentariosRevision: string;
}

export interface UpdateSystemConfigRequest {
  valor: string;
}
