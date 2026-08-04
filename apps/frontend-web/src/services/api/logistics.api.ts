import { http } from '@/services/http';
import type {
  BranchQueueItemDto,
  ConfirmReceptionRequest,
  CourierDeliveryDto,
  EmployeeBranchDto,
  RecordDeliveryAttemptRequest,
  ShipmentDetailDto,
  ShipmentSummaryDto,
} from '@/types/logistics';

/**
 * Endpoints reales de Logistics (`apps/backend/src/logistics/controllers/`).
 *
 * Todos exigen JWT y **acotan por actor** en vez de por rol: el backend
 * resuelve el `Cliente`, `Vendedor`, `Empleado` o `Repartidor` del usuario y
 * responde **404, no 403**, cuando el recurso no le corresponde — la misma
 * convención de Orders.
 */
export const logisticsApi = {
  /* ── Cliente ─────────────────────────────────────────────────────────── */

  /**
   * `GET /logistics/orders/:pedidoId/shipments`
   *
   * Un envío por cada `PedidoVendedor`, así que un pedido multivendedor
   * devuelve varios. Un array vacío es una respuesta legítima: el pedido se
   * pagó y el fulfillment todavía no ha creado las guías.
   */
  listByOrder(pedidoId: string): Promise<ShipmentSummaryDto[]> {
    return http.get<ShipmentSummaryDto[]>(`/logistics/orders/${pedidoId}/shipments`);
  },

  /**
   * `GET /logistics/shipments/:id`
   *
   * Lo abren el cliente dueño del pedido, el vendedor dueño del
   * `PedidoVendedor` y el repartidor con la entrega asignada. Trae el
   * `historial` completo de `EventoTracking`.
   */
  getShipment(shipmentId: string): Promise<ShipmentDetailDto> {
    return http.get<ShipmentDetailDto>(`/logistics/shipments/${shipmentId}`);
  },

  /* ── Vendedor ────────────────────────────────────────────────────────── */

  /**
   * `GET /logistics/vendors/me/pending-shipments`
   *
   * Solo los envíos en `PENDIENTE_RECEPCION`: lo que el vendedor todavía tiene
   * que llevar a su sucursal. En cuanto la sucursal los recibe, desaparecen de
   * esta lista.
   */
  listVendorPending(): Promise<ShipmentSummaryDto[]> {
    return http.get<ShipmentSummaryDto[]>('/logistics/vendors/me/pending-shipments');
  },

  /* ── Sucursal ────────────────────────────────────────────────────────── */

  /** `GET /logistics/branches/me` — sucursal del empleado autenticado. */
  getMyBranch(): Promise<EmployeeBranchDto> {
    return http.get<EmployeeBranchDto>('/logistics/branches/me');
  },

  /** `GET /logistics/branches/:sucursalId/reception-queue` — envíos en `PENDIENTE_RECEPCION`. */
  listReceptionQueue(sucursalId: string): Promise<BranchQueueItemDto[]> {
    return http.get<BranchQueueItemDto[]>(
      `/logistics/branches/${sucursalId}/reception-queue`,
    );
  },

  /** `GET /logistics/branches/:sucursalId/dispatch-queue` — envíos en `CLASIFICADO`. */
  listDispatchQueue(sucursalId: string): Promise<BranchQueueItemDto[]> {
    return http.get<BranchQueueItemDto[]>(
      `/logistics/branches/${sucursalId}/dispatch-queue`,
    );
  },

  /**
   * `POST /logistics/reception`
   *
   * El recepcionista **solo certifica el hecho físico**. Al aceptar un
   * paquete, el orquestador encadena por su cuenta clasificación, ruta y
   * asignación de repartidor dentro de la misma petición: la respuesta ya
   * puede venir en `EN_TRANSITO` o `EN_REPARTO`.
   */
  confirmReception(body: ConfirmReceptionRequest): Promise<ShipmentDetailDto> {
    return http.post<ShipmentDetailDto>('/logistics/reception', body);
  },

  /**
   * `POST /logistics/shipments/:id/retry-planning`
   *
   * Reintento manual cuando la planificación se quedó esperando: sin vehículo
   * disponible (`CLASIFICADO`) o sin repartidor libre (`EN_SUCURSAL_DESTINO`).
   */
  retryPlanning(shipmentId: string): Promise<ShipmentDetailDto> {
    return http.post<ShipmentDetailDto>(`/logistics/shipments/${shipmentId}/retry-planning`);
  },

  /** `POST /logistics/transfers/:id/arrival` — lo confirma la sucursal **destino**. */
  confirmTransferArrival(transferenciaId: string): Promise<ShipmentDetailDto> {
    return http.post<ShipmentDetailDto>(`/logistics/transfers/${transferenciaId}/arrival`);
  },

  /* ── Repartidor ──────────────────────────────────────────────────────── */

  /** `GET /logistics/couriers/me/deliveries` — entregas con el envío en `EN_REPARTO`. */
  listMyDeliveries(): Promise<CourierDeliveryDto[]> {
    return http.get<CourierDeliveryDto[]>('/logistics/couriers/me/deliveries');
  },

  /**
   * `POST /logistics/deliveries/:entregaId/attempts`
   *
   * El repartidor registra el resultado; **el backend decide** si eso significa
   * entregado, reintentar o devolver, comparando el número de intento contra
   * `MAX_DELIVERY_ATTEMPTS` de la configuración del sistema.
   */
  recordDeliveryAttempt(
    entregaId: string,
    body: RecordDeliveryAttemptRequest,
  ): Promise<ShipmentDetailDto> {
    return http.post<ShipmentDetailDto>(
      `/logistics/deliveries/${entregaId}/attempts`,
      body,
    );
  },
};
