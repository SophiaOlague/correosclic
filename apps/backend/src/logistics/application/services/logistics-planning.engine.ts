import { Injectable } from '@nestjs/common';
import { EstadoEnvio, ResultadoIntentoEntrega } from '@correosclic/database';

import { RouteResolver } from '../../domain/services/route-resolver';
import { DeliveryAssignmentPolicy } from '../../domain/services/delivery-assignment-policy';
import { DeliveryRetryPolicy } from '../../domain/services/delivery-retry-policy';
import { VehicleCapacityPolicy } from '../../domain/services/vehicle-capacity-policy';
import { ShipmentStateTransitionPolicy } from '../../domain/services/shipment-state-transition-policy';
import { ResultadoRecepcion } from '../../domain/resultado-recepcion';
import { InvalidShipmentPhaseException } from '../../domain/exceptions/invalid-shipment-phase.exception';
import { InvalidShipmentTransitionException } from '../../domain/exceptions/invalid-shipment-transition.exception';

import { BranchRepository } from '../../infrastructure/repositories/branch.repository';
import { CourierRepository } from '../../infrastructure/repositories/courier.repository';
import { SystemConfigRepository } from '../../../system-config/infrastructure/repositories/system-config.repository';
import { ConfiguracionSistemaKey } from '../../../system-config/domain/configuracion-sistema-key';

import {
  DeliveryAssignmentPlan,
  DeliveryOutcomePlan,
  ReceptionOutcomePlan,
  RoutingPlan,
} from '../interfaces/shipment-plan.interface';

export interface ShipmentRouteContext {
  estado: EstadoEnvio;
  sucursalOrigenId: string;
  sucursalDestinoId: string;
  pesoRealKg: number | null;
}

export interface ShipmentDeliveryContext {
  estado: EstadoEnvio;
  sucursalDestinoId: string;
  pesoCobrableKg: number | null;
}

/** Estado en el que queda el envío según lo que certificó el recepcionista. */
export const ESTADO_POR_RESULTADO_RECEPCION: Record<
  ResultadoRecepcion,
  EstadoEnvio
> = {
  [ResultadoRecepcion.ACEPTADO]: EstadoEnvio.RECIBIDO_SUCURSAL,
  [ResultadoRecepcion.DANADO]: EstadoEnvio.DANADO,
  [ResultadoRecepcion.RECHAZADO]: EstadoEnvio.CANCELADO,
};

const ACCION_POR_RESULTADO_RECEPCION: Record<
  ResultadoRecepcion,
  ReceptionOutcomePlan
> = {
  [ResultadoRecepcion.ACEPTADO]: { accion: 'ACEPTAR' },
  [ResultadoRecepcion.DANADO]: { accion: 'MARCAR_DANADO' },
  [ResultadoRecepcion.RECHAZADO]: { accion: 'RECHAZAR' },
};

/**
 * El corazón del módulo: cada fase tiene una precondición de estado
 * explícita y un tipo de retorno propio (ver shipment-plan.interface.ts).
 * DeliveryAssignmentPolicy solo es alcanzable desde
 * planDeliveryAssignmentPhase -- ningún otro método del engine puede
 * producir esa decisión, ni siquiera por error.
 */
@Injectable()
export class LogisticsPlanningEngine {
  constructor(
    private readonly routeResolver: RouteResolver,
    private readonly deliveryAssignmentPolicy: DeliveryAssignmentPolicy,
    private readonly deliveryRetryPolicy: DeliveryRetryPolicy,
    private readonly vehicleCapacityPolicy: VehicleCapacityPolicy,
    private readonly stateTransitionPolicy: ShipmentStateTransitionPolicy,
    private readonly branchRepository: BranchRepository,
    private readonly courierRepository: CourierRepository,
    private readonly systemConfigRepository: SystemConfigRepository,
  ) {}

  /**
   * Precondición: envio.estado === PENDIENTE_RECEPCION.
   *
   * Traduce lo que el recepcionista certificó al estado destino, y valida esa
   * transición contra ShipmentStateTransitionPolicy antes de que nadie toque
   * la base de datos. Es la única fase que puede sacar a un envío de
   * PENDIENTE_RECEPCION.
   */
  planReceptionOutcomePhase(params: {
    estado: EstadoEnvio;
    resultado: ResultadoRecepcion;
  }): ReceptionOutcomePlan {
    if (params.estado !== EstadoEnvio.PENDIENTE_RECEPCION) {
      throw new InvalidShipmentPhaseException();
    }

    const estadoDestino = ESTADO_POR_RESULTADO_RECEPCION[params.resultado];

    if (
      !this.stateTransitionPolicy.isValidTransition(params.estado, estadoDestino)
    ) {
      throw new InvalidShipmentTransitionException();
    }

    return ACCION_POR_RESULTADO_RECEPCION[params.resultado];
  }

  /**
   * Precondición: envio.estado === RECIBIDO_SUCURSAL (primera pasada) o
   * CLASIFICADO (reintento manual tras ESPERAR_VEHICULO). La decisión de
   * ruta en sí no depende de cuál de las dos fue.
   */
  async planClassificationAndRoutingPhase(
    envio: ShipmentRouteContext,
  ): Promise<RoutingPlan> {
    if (
      envio.estado !== EstadoEnvio.RECIBIDO_SUCURSAL &&
      envio.estado !== EstadoEnvio.CLASIFICADO
    ) {
      throw new InvalidShipmentPhaseException();
    }

    const { requiereTransferencia } = this.routeResolver.resolve(
      envio.sucursalOrigenId,
      envio.sucursalDestinoId,
    );

    if (!requiereTransferencia) {
      return { accion: 'SIN_TRANSFERENCIA' };
    }

    const vehiculos = await this.branchRepository.findVehiclesAtBranch(
      envio.sucursalOrigenId,
    );

    const pesoEnvioKg = envio.pesoRealKg ?? 0;

    const vehiculoElegible = vehiculos.find((vehiculo) =>
      this.vehicleCapacityPolicy.cumpleCapacidad(
        pesoEnvioKg,
        vehiculo.capacidadKg,
      ),
    );

    if (!vehiculoElegible) {
      return { accion: 'ESPERAR_VEHICULO' };
    }

    return { accion: 'CREAR_TRANSFERENCIA', vehiculoId: vehiculoElegible.id };
  }

  /** Precondición: envio.estado === EN_SUCURSAL_DESTINO. Único punto de entrada de DeliveryAssignmentPolicy. */
  async planDeliveryAssignmentPhase(
    envio: ShipmentDeliveryContext,
  ): Promise<DeliveryAssignmentPlan> {
    if (envio.estado !== EstadoEnvio.EN_SUCURSAL_DESTINO) {
      throw new InvalidShipmentPhaseException();
    }

    const candidatos = await this.courierRepository.findAvailableCandidates(
      envio.sucursalDestinoId,
    );

    const seleccionado = this.deliveryAssignmentPolicy.seleccionarCandidato(
      candidatos,
      envio.pesoCobrableKg ?? 0,
    );

    if (!seleccionado) {
      return { accion: 'ESPERAR_DISPONIBILIDAD' };
    }

    return {
      accion: 'ASIGNAR',
      repartidorId: seleccionado.repartidorId,
      vehiculoId: seleccionado.vehiculoId,
    };
  }

  /** Precondición: envio.estado === EN_REPARTO, tras registrar un intento. */
  async planRetryOrReturnPhase(params: {
    estadoEnvio: EstadoEnvio;
    resultado: ResultadoIntentoEntrega;
    numeroIntento: number;
  }): Promise<DeliveryOutcomePlan> {
    if (params.estadoEnvio !== EstadoEnvio.EN_REPARTO) {
      throw new InvalidShipmentPhaseException();
    }

    if (params.resultado === ResultadoIntentoEntrega.EXITOSO) {
      return { accion: 'ENTREGADO' };
    }

    const maximoIntentos = await this.systemConfigRepository.getNumber(
      ConfiguracionSistemaKey.MAX_DELIVERY_ATTEMPTS,
    );

    const debeDevolver = this.deliveryRetryPolicy.debeDevolverAlRemitente(
      params.numeroIntento,
      maximoIntentos,
    );

    return debeDevolver ? { accion: 'DEVOLVER' } : { accion: 'REINTENTAR' };
  }
}
