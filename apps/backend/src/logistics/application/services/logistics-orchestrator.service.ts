import { Injectable } from '@nestjs/common';
import { EstadoEnvio, ResultadoIntentoEntrega } from '@correosclic/database';

import { ShipmentRepository } from '../../infrastructure/repositories/shipment.repository';
import { BranchRepository } from '../../infrastructure/repositories/branch.repository';
import { CourierRepository } from '../../infrastructure/repositories/courier.repository';

import { LogisticsPlanningEngine } from './logistics-planning.engine';

import { ShipmentNotFoundException } from '../../domain/exceptions/shipment-not-found.exception';
import { InvalidShipmentTransitionException } from '../../domain/exceptions/invalid-shipment-transition.exception';
import { InvalidShipmentPhaseException } from '../../domain/exceptions/invalid-shipment-phase.exception';

export interface ConfirmReceptionInput {
  trackingInterno: string;
  usuarioId: string;
  observaciones?: string;
  pesoRealKg?: number;
}

export interface ConfirmTransferArrivalInput {
  transferenciaId: string;
  usuarioId: string;
}

export interface RetryPlanningInput {
  envioId: string;
  usuarioId: string;
}

export interface RecordDeliveryAttemptInput {
  entregaId: string;
  usuarioId: string;
  resultado: ResultadoIntentoEntrega;
  observaciones?: string;
  fotoIntentoUrl?: string;
  nombreRecibe?: string;
}

/**
 * Único punto de control del flujo operativo de un Envio. Cada método
 * público corresponde a un hecho físico certificado por un actor (nunca a
 * un evento intramódulo): confirma el hecho, y a partir de ahí llama
 * explícitamente al LogisticsPlanningEngine y ejecuta el Plan resultante.
 * Cuando una fase puede resolverse sin esperar otro hecho físico (ej. envío
 * sin transferencia -> pasa directo a buscar repartidor), este mismo método
 * encadena la siguiente llamada -- es código secuencial explícito, no un
 * listener reaccionando a otro.
 */
@Injectable()
export class LogisticsOrchestratorService {
  constructor(
    private readonly shipmentRepository: ShipmentRepository,
    private readonly branchRepository: BranchRepository,
    private readonly courierRepository: CourierRepository,
    private readonly planningEngine: LogisticsPlanningEngine,
  ) {}

  async confirmReception(input: ConfirmReceptionInput) {
    const empleado = await this.branchRepository.findEmpleadoByUsuarioId(
      input.usuarioId,
    );

    if (!empleado || !empleado.activo) {
      throw new ShipmentNotFoundException();
    }

    const envio = await this.shipmentRepository.findByTrackingInterno(
      input.trackingInterno,
    );

    if (!envio || envio.sucursalOrigenId !== empleado.sucursalId) {
      throw new ShipmentNotFoundException();
    }

    const recibido = await this.shipmentRepository.confirmReception({
      envioId: envio.id,
      empleadoId: empleado.id,
      observaciones: input.observaciones,
      pesoRealKg: input.pesoRealKg,
    });

    if (!recibido) {
      throw new InvalidShipmentTransitionException();
    }

    await this.runClassificationAndRouting(recibido);

    return this.getDetailOrThrow(envio.id);
  }

  async confirmTransferArrival(input: ConfirmTransferArrivalInput) {
    const empleado = await this.branchRepository.findEmpleadoByUsuarioId(
      input.usuarioId,
    );

    if (!empleado || !empleado.activo) {
      throw new ShipmentNotFoundException();
    }

    const transferencia = await this.shipmentRepository.findTransferById(
      input.transferenciaId,
    );

    if (!transferencia || transferencia.sucursalDestinoId !== empleado.sucursalId) {
      throw new ShipmentNotFoundException();
    }

    const enDestino = await this.shipmentRepository.confirmTransferArrival({
      transferenciaId: input.transferenciaId,
      envioId: transferencia.envioId,
    });

    if (!enDestino) {
      throw new InvalidShipmentTransitionException();
    }

    await this.runDeliveryAssignment(enDestino);

    return this.getDetailOrThrow(transferencia.envioId);
  }

  /** Reintento manual de planificación: ESPERAR_VEHICULO (CLASIFICADO) o ESPERAR_DISPONIBILIDAD (EN_SUCURSAL_DESTINO). */
  async retryPlanning(input: RetryPlanningInput) {
    const empleado = await this.branchRepository.findEmpleadoByUsuarioId(
      input.usuarioId,
    );

    if (!empleado || !empleado.activo) {
      throw new ShipmentNotFoundException();
    }

    const envio = await this.shipmentRepository.findById(input.envioId);

    if (!envio) {
      throw new ShipmentNotFoundException();
    }

    if (envio.estado === EstadoEnvio.CLASIFICADO) {
      if (empleado.sucursalId !== envio.sucursalOrigenId) {
        throw new ShipmentNotFoundException();
      }

      await this.runClassificationAndRouting(envio, true);
    } else if (envio.estado === EstadoEnvio.EN_SUCURSAL_DESTINO) {
      if (empleado.sucursalId !== envio.sucursalDestinoId) {
        throw new ShipmentNotFoundException();
      }

      await this.runDeliveryAssignment(envio);
    } else {
      throw new InvalidShipmentPhaseException();
    }

    return this.getDetailOrThrow(input.envioId);
  }

  async recordDeliveryAttempt(input: RecordDeliveryAttemptInput) {
    const repartidor = await this.courierRepository.findByUsuarioId(
      input.usuarioId,
    );

    if (!repartidor || !repartidor.activo) {
      throw new ShipmentNotFoundException();
    }

    const entrega = await this.shipmentRepository.findEntregaById(
      input.entregaId,
    );

    if (!entrega || entrega.repartidorId !== repartidor.id) {
      throw new ShipmentNotFoundException();
    }

    if (entrega.envio.estado !== EstadoEnvio.EN_REPARTO) {
      throw new InvalidShipmentTransitionException();
    }

    const intentosPrevios = await this.shipmentRepository.countDeliveryAttempts(
      input.entregaId,
    );

    const plan = await this.planningEngine.planRetryOrReturnPhase({
      estadoEnvio: entrega.envio.estado,
      resultado: input.resultado,
      numeroIntento: intentosPrevios + 1,
    });

    await this.shipmentRepository.recordDeliveryAttempt({
      entregaId: input.entregaId,
      envioId: entrega.envio.id,
      resultado: input.resultado,
      observaciones: input.observaciones,
      fotoIntentoUrl: input.fotoIntentoUrl,
      nombreRecibe: input.nombreRecibe,
      esExitoso: plan.accion === 'ENTREGADO',
      esDevolucion: plan.accion === 'DEVOLVER',
    });

    return this.getDetailOrThrow(entrega.envio.id);
  }

  private async runClassificationAndRouting(
    envio: {
      id: string;
      estado: EstadoEnvio;
      sucursalOrigenId: string;
      sucursalDestinoId: string;
      pesoRealKg: unknown;
    },
    esReintento = false,
  ): Promise<void> {
    const plan = await this.planningEngine.planClassificationAndRoutingPhase({
      estado: envio.estado,
      sucursalOrigenId: envio.sucursalOrigenId,
      sucursalDestinoId: envio.sucursalDestinoId,
      pesoRealKg: envio.pesoRealKg === null ? null : Number(envio.pesoRealKg),
    });

    const decision =
      plan.accion === 'CREAR_TRANSFERENCIA'
        ? ('CREAR_TRANSFERENCIA' as const)
        : plan.accion === 'ESPERAR_VEHICULO'
          ? ('SOLO_CLASIFICAR' as const)
          : ('SIN_TRANSFERENCIA' as const);

    const resultado = esReintento
      ? await this.shipmentRepository.applyRouteDecisionFromClassified({
          envioId: envio.id,
          decision,
          vehiculoId:
            plan.accion === 'CREAR_TRANSFERENCIA' ? plan.vehiculoId : undefined,
        })
      : await this.shipmentRepository.classifyAndRoute({
          envioId: envio.id,
          decision,
          vehiculoId:
            plan.accion === 'CREAR_TRANSFERENCIA' ? plan.vehiculoId : undefined,
        });

    if (!resultado) {
      throw new InvalidShipmentTransitionException();
    }

    if (plan.accion === 'SIN_TRANSFERENCIA') {
      // Encadenamiento explícito: mismo request, no un evento nuevo.
      await this.runDeliveryAssignment(resultado);
    }
  }

  private async runDeliveryAssignment(envio: {
    id: string;
    estado: EstadoEnvio;
    sucursalDestinoId: string;
    pesoCobrableKg: unknown;
    pesoRealKg: unknown;
  }): Promise<void> {
    const pesoKg =
      envio.pesoCobrableKg !== null
        ? Number(envio.pesoCobrableKg)
        : envio.pesoRealKg !== null
          ? Number(envio.pesoRealKg)
          : null;

    const plan = await this.planningEngine.planDeliveryAssignmentPhase({
      estado: envio.estado,
      sucursalDestinoId: envio.sucursalDestinoId,
      pesoCobrableKg: pesoKg,
    });

    if (plan.accion === 'ESPERAR_DISPONIBILIDAD') {
      return;
    }

    const resultado = await this.shipmentRepository.assignDelivery({
      envioId: envio.id,
      repartidorId: plan.repartidorId,
    });

    if (!resultado) {
      throw new InvalidShipmentTransitionException();
    }
  }

  private async getDetailOrThrow(envioId: string) {
    const detalle = await this.shipmentRepository.findById(envioId);

    if (!detalle) {
      throw new ShipmentNotFoundException();
    }

    return detalle;
  }
}
