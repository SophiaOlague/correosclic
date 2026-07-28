import { DeliveryRetryPolicy } from './delivery-retry-policy';

describe('DeliveryRetryPolicy', () => {
  const policy = new DeliveryRetryPolicy();

  it('no devuelve al remitente si aún quedan intentos disponibles', () => {
    expect(policy.debeDevolverAlRemitente(1, 3)).toBe(false);
    expect(policy.debeDevolverAlRemitente(2, 3)).toBe(false);
  });

  it('devuelve al remitente cuando se alcanza el máximo de intentos', () => {
    expect(policy.debeDevolverAlRemitente(3, 3)).toBe(true);
  });

  it('devuelve al remitente si por alguna razón se excede el máximo', () => {
    expect(policy.debeDevolverAlRemitente(4, 3)).toBe(true);
  });
});
