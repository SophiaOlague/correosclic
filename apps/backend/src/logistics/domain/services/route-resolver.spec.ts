import { RouteResolver } from './route-resolver';

describe('RouteResolver', () => {
  const resolver = new RouteResolver();

  it('requiere transferencia cuando origen y destino son sucursales distintas', () => {
    const resultado = resolver.resolve('sucursal-1', 'sucursal-2');
    expect(resultado.requiereTransferencia).toBe(true);
  });

  it('no requiere transferencia cuando origen y destino son la misma sucursal', () => {
    const resultado = resolver.resolve('sucursal-1', 'sucursal-1');
    expect(resultado.requiereTransferencia).toBe(false);
  });
});
