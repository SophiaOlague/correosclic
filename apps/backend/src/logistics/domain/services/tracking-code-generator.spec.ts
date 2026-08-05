import { TrackingCodeGenerator } from './tracking-code-generator';

describe('TrackingCodeGenerator', () => {
  const generator = new TrackingCodeGenerator();

  it('genera un código con el prefijo ENV y el timestamp dado', () => {
    const referenceDate = new Date(2026, 6, 28, 9, 5, 3);
    const codigo = generator.generate(referenceDate);

    expect(codigo).toMatch(/^ENV-20260728090503-[A-Z0-9]{6}$/);
  });

  it('genera códigos distintos en llamadas sucesivas', () => {
    const referenceDate = new Date(2026, 6, 28, 9, 5, 3);
    const primero = generator.generate(referenceDate);
    const segundo = generator.generate(referenceDate);

    expect(primero).not.toEqual(segundo);
  });
});
