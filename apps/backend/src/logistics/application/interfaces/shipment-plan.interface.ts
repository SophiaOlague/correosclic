/**
 * Cada fase del LogisticsPlanningEngine regresa su propio tipo de Plan --
 * estructuralmente no pueden mezclarse entre fases. Por ejemplo, la fase de
 * clasificación/ruta no tiene forma de producir una decisión de asignación
 * de reparto: ese tipo simplemente no existe en su union.
 */

export type RoutingPlan =
  | { accion: 'SIN_TRANSFERENCIA' }
  | { accion: 'CREAR_TRANSFERENCIA'; vehiculoId: string }
  | { accion: 'ESPERAR_VEHICULO' };

export type DeliveryAssignmentPlan =
  | { accion: 'ASIGNAR'; repartidorId: string; vehiculoId: string }
  | { accion: 'ESPERAR_DISPONIBILIDAD' };

export type DeliveryOutcomePlan =
  | { accion: 'ENTREGADO' }
  | { accion: 'REINTENTAR' }
  | { accion: 'DEVOLVER' };
