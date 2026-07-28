import { Injectable } from '@nestjs/common';

export interface GeoCoordinates {
  latitud: number;
  longitud: number;
}

const EARTH_RADIUS_KM = 6371;

@Injectable()
export class HaversineDistanceCalculator {
  calculateKm(
    origin: GeoCoordinates,
    destination: GeoCoordinates,
  ): number {
    const deltaLatitud = this.toRadians(
      destination.latitud - origin.latitud,
    );

    const deltaLongitud = this.toRadians(
      destination.longitud - origin.longitud,
    );

    const haversine =
      Math.sin(deltaLatitud / 2) ** 2 +
      Math.cos(this.toRadians(origin.latitud)) *
        Math.cos(this.toRadians(destination.latitud)) *
        Math.sin(deltaLongitud / 2) ** 2;

    const angularDistance =
      2 *
      Math.atan2(
        Math.sqrt(haversine),
        Math.sqrt(1 - haversine),
      );

    return EARTH_RADIUS_KM * angularDistance;
  }

  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
