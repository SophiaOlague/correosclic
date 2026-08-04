import {
  MotivoNoPublicable,
  ProductPublicationPolicy,
} from './product-publication.policy';

describe('ProductPublicationPolicy', () => {
  const policy = new ProductPublicationPolicy();

  it('permite publicar cuando hay una variante activa con stock', () => {
    expect(
      policy.puedePublicarse([{ activa: true, stockDisponible: 5 }]),
    ).toEqual({ publicable: true });
  });

  it('rechaza un producto sin variantes', () => {
    expect(policy.puedePublicarse([])).toEqual({
      publicable: false,
      motivo: MotivoNoPublicable.SIN_VARIANTES,
    });
  });

  it('rechaza un producto cuyas variantes están todas inactivas', () => {
    expect(
      policy.puedePublicarse([{ activa: false, stockDisponible: 10 }]),
    ).toEqual({
      publicable: false,
      motivo: MotivoNoPublicable.SIN_VARIANTES,
    });
  });

  it('rechaza cuando ninguna variante activa tiene inventario', () => {
    expect(
      policy.puedePublicarse([
        { activa: true, stockDisponible: null },
        { activa: false, stockDisponible: 10 },
      ]),
    ).toEqual({
      publicable: false,
      motivo: MotivoNoPublicable.SIN_INVENTARIO,
    });
  });

  it('rechaza cuando el inventario existe pero está agotado', () => {
    expect(
      policy.puedePublicarse([{ activa: true, stockDisponible: 0 }]),
    ).toEqual({
      publicable: false,
      motivo: MotivoNoPublicable.SIN_STOCK,
    });
  });

  it('basta con que una sola variante activa tenga stock', () => {
    expect(
      policy.puedePublicarse([
        { activa: true, stockDisponible: 0 },
        { activa: true, stockDisponible: null },
        { activa: true, stockDisponible: 3 },
      ]),
    ).toEqual({ publicable: true });
  });

  it('ignora las variantes inactivas aunque tengan stock', () => {
    expect(
      policy.puedePublicarse([
        { activa: true, stockDisponible: 0 },
        { activa: false, stockDisponible: 99 },
      ]),
    ).toEqual({
      publicable: false,
      motivo: MotivoNoPublicable.SIN_STOCK,
    });
  });
});
