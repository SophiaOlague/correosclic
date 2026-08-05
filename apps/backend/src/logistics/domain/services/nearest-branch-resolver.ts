import { Injectable } from '@nestjs/common';

import {
  GeoCoordinates,
  HaversineDistanceCalculator,
} from '../../../shared/geo/haversine-distance.calculator';

export interface BranchCandidate {
  id: string;
  coordenadas: GeoCoordinates;
}

/**
 * Resuelve la sucursal activa más cercana a un punto de origen o destino
 * (decisión (c) del diseño). No hay relación Vendedor->Sucursal ni
 * Cliente->Sucursal en el schema, así que origen/destino de un Envio se
 * calculan dinámicamente por distancia en el momento de su creación.
 */
@Injectable()
export class NearestBranchResolver {
  constructor(
    private readonly distanceCalculator: HaversineDistanceCalculator,
  ) {}

  resolve(
    origen: GeoCoordinates,
    candidatas: BranchCandidate[],
  ): BranchCandidate | null {
    if (candidatas.length === 0) {
      return null;
    }

    return candidatas.reduce((masCercana, candidata) => {
      const distanciaCandidata = this.distanceCalculator.calculateKm(
        origen,
        candidata.coordenadas,
      );
      const distanciaMasCercana = this.distanceCalculator.calculateKm(
        origen,
        masCercana.coordenadas,
      );

      return distanciaCandidata < distanciaMasCercana
        ? candidata
        : masCercana;
    });
  }
}
