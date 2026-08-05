import {
  CourierCandidate,
  DeliveryAssignmentPolicy,
} from './delivery-assignment-policy';
import { VehicleCapacityPolicy } from './vehicle-capacity-policy';

describe('DeliveryAssignmentPolicy', () => {
  const policy = new DeliveryAssignmentPolicy(new VehicleCapacityPolicy());

  const candidatos: CourierCandidate[] = [
    { repartidorId: 'r1', vehiculoId: 'v1', capacidadVehiculoKg: 5 },
    { repartidorId: 'r2', vehiculoId: 'v2', capacidadVehiculoKg: 50 },
  ];

  it('regresa null si no hay candidatos', () => {
    expect(policy.seleccionarCandidato([], 10)).toBeNull();
  });

  it('regresa null si ningún candidato tiene capacidad suficiente', () => {
    expect(policy.seleccionarCandidato(candidatos, 1000)).toBeNull();
  });

  it('salta al candidato sin capacidad suficiente y elige el que sí cumple', () => {
    const resultado = policy.seleccionarCandidato(candidatos, 10);
    expect(resultado).toEqual({ repartidorId: 'r2', vehiculoId: 'v2' });
  });

  it('elige el primer candidato elegible cuando varios cumplen', () => {
    const variosElegibles: CourierCandidate[] = [
      { repartidorId: 'r1', vehiculoId: 'v1', capacidadVehiculoKg: 50 },
      { repartidorId: 'r2', vehiculoId: 'v2', capacidadVehiculoKg: 100 },
    ];

    const resultado = policy.seleccionarCandidato(variosElegibles, 10);
    expect(resultado).toEqual({ repartidorId: 'r1', vehiculoId: 'v1' });
  });
});
