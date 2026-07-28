import { VehicleCapacityPolicy } from './vehicle-capacity-policy';

describe('VehicleCapacityPolicy', () => {
  const policy = new VehicleCapacityPolicy();

  it('cumple cuando la capacidad es mayor al peso del envío', () => {
    expect(policy.cumpleCapacidad(10, 20)).toBe(true);
  });

  it('cumple cuando la capacidad es exactamente igual al peso del envío', () => {
    expect(policy.cumpleCapacidad(20, 20)).toBe(true);
  });

  it('no cumple cuando la capacidad es menor al peso del envío', () => {
    expect(policy.cumpleCapacidad(21, 20)).toBe(false);
  });
});
