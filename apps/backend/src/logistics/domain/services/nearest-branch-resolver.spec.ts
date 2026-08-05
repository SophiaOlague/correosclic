import { HaversineDistanceCalculator } from '../../../shared/geo/haversine-distance.calculator';
import { NearestBranchResolver } from './nearest-branch-resolver';

describe('NearestBranchResolver', () => {
  const resolver = new NearestBranchResolver(new HaversineDistanceCalculator());

  // Coordenadas aproximadas de CDMX, Guadalajara y Monterrey.
  const cdmx = { latitud: 19.4326, longitud: -99.1332 };
  const guadalajara = { id: 'guadalajara', coordenadas: { latitud: 20.6597, longitud: -103.3496 } };
  const monterrey = { id: 'monterrey', coordenadas: { latitud: 25.6866, longitud: -100.3161 } };

  it('regresa null si no hay candidatas', () => {
    expect(resolver.resolve(cdmx, [])).toBeNull();
  });

  it('regresa la única candidata si solo hay una', () => {
    expect(resolver.resolve(cdmx, [monterrey])).toEqual(monterrey);
  });

  it('elige la sucursal más cercana por distancia Haversine', () => {
    // Desde CDMX, Guadalajara (~460km) está más cerca que Monterrey (~720km).
    const resultado = resolver.resolve(cdmx, [monterrey, guadalajara]);
    expect(resultado).toEqual(guadalajara);
  });
});
