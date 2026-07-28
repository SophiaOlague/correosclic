import { Injectable } from '@nestjs/common';

import { VehicleCapacityPolicy } from './vehicle-capacity-policy';

export interface CourierCandidate {
  repartidorId: string;
  vehiculoId: string;
  capacidadVehiculoKg: number;
}

export interface DeliveryAssignmentResult {
  repartidorId: string;
  vehiculoId: string;
}

/**
 * Elige el repartidor a asignar a un Envio que ya llegó a su sucursal
 * destino. Solo se invoca desde esa fase (ver LogisticsPlanningEngine); no
 * hace batching de múltiples envíos por vehículo en v1 -- cada candidato se
 * evalúa contra el peso de este envío individualmente.
 */
@Injectable()
export class DeliveryAssignmentPolicy {
  constructor(
    private readonly vehicleCapacityPolicy: VehicleCapacityPolicy,
  ) {}

  seleccionarCandidato(
    candidatos: CourierCandidate[],
    pesoEnvioKg: number,
  ): DeliveryAssignmentResult | null {
    const elegible = candidatos.find((candidato) =>
      this.vehicleCapacityPolicy.cumpleCapacidad(
        pesoEnvioKg,
        candidato.capacidadVehiculoKg,
      ),
    );

    if (!elegible) {
      return null;
    }

    return {
      repartidorId: elegible.repartidorId,
      vehiculoId: elegible.vehiculoId,
    };
  }
}
