import { Injectable } from '@nestjs/common';

@Injectable()
export class VehicleCapacityPolicy {
  cumpleCapacidad(pesoEnvioKg: number, capacidadVehiculoKg: number): boolean {
    return capacidadVehiculoKg >= pesoEnvioKg;
  }
}
