import { EstadoEnvio } from '@correosclic/database';

import {
  ESTADOS_ENVIO_TERMINALES,
  ShipmentStateTransitionPolicy,
} from './shipment-state-transition-policy';

describe('ShipmentStateTransitionPolicy', () => {
  const policy = new ShipmentStateTransitionPolicy();

  it('permite el flujo feliz completo, un paso a la vez', () => {
    const flujoFeliz: EstadoEnvio[] = [
      EstadoEnvio.PENDIENTE_RECEPCION,
      EstadoEnvio.RECIBIDO_SUCURSAL,
      EstadoEnvio.CLASIFICADO,
      EstadoEnvio.EN_TRANSITO,
      EstadoEnvio.EN_SUCURSAL_DESTINO,
      EstadoEnvio.EN_REPARTO,
      EstadoEnvio.ENTREGADO,
    ];

    for (let i = 0; i < flujoFeliz.length - 1; i++) {
      expect(
        policy.isValidTransition(flujoFeliz[i], flujoFeliz[i + 1]),
      ).toBe(true);
    }
  });

  it('permite CLASIFICADO -> EN_SUCURSAL_DESTINO directo (sin transferencia, origen == destino)', () => {
    expect(
      policy.isValidTransition(
        EstadoEnvio.CLASIFICADO,
        EstadoEnvio.EN_SUCURSAL_DESTINO,
      ),
    ).toBe(true);
  });

  it('permite quedarse en el mismo estado (no-op idempotente)', () => {
    expect(
      policy.isValidTransition(
        EstadoEnvio.RECIBIDO_SUCURSAL,
        EstadoEnvio.RECIBIDO_SUCURSAL,
      ),
    ).toBe(true);
  });

  it('rechaza retroceder a un estado anterior', () => {
    expect(
      policy.isValidTransition(
        EstadoEnvio.EN_TRANSITO,
        EstadoEnvio.RECIBIDO_SUCURSAL,
      ),
    ).toBe(false);
  });

  it('rechaza saltar etapas (PENDIENTE_RECEPCION -> EN_REPARTO)', () => {
    expect(
      policy.isValidTransition(
        EstadoEnvio.PENDIENTE_RECEPCION,
        EstadoEnvio.EN_REPARTO,
      ),
    ).toBe(false);
  });

  it('permite que la recepción cierre el envío en DANADO o CANCELADO sin pasar por RECIBIDO_SUCURSAL', () => {
    expect(
      policy.isValidTransition(
        EstadoEnvio.PENDIENTE_RECEPCION,
        EstadoEnvio.DANADO,
      ),
    ).toBe(true);
    expect(
      policy.isValidTransition(
        EstadoEnvio.PENDIENTE_RECEPCION,
        EstadoEnvio.CANCELADO,
      ),
    ).toBe(true);
  });

  it('permite pasar a estados excepcionales desde etapas operativas activas', () => {
    expect(
      policy.isValidTransition(EstadoEnvio.EN_TRANSITO, EstadoEnvio.EXTRAVIADO),
    ).toBe(true);
    expect(
      policy.isValidTransition(EstadoEnvio.EN_REPARTO, EstadoEnvio.DANADO),
    ).toBe(true);
    expect(
      policy.isValidTransition(EstadoEnvio.EN_SUCURSAL_DESTINO, EstadoEnvio.DEVUELTO),
    ).toBe(true);
  });

  it.each(ESTADOS_ENVIO_TERMINALES)(
    'no permite salir del estado terminal %s hacia ningún otro estado',
    (estadoTerminal) => {
      const todosLosEstados = Object.values(EstadoEnvio);

      for (const siguiente of todosLosEstados) {
        const esValida = policy.isValidTransition(estadoTerminal, siguiente);
        expect(esValida).toBe(siguiente === estadoTerminal);
      }
    },
  );

  it.each(ESTADOS_ENVIO_TERMINALES)(
    'esEstadoTerminal(%s) es true',
    (estado) => {
      expect(policy.esEstadoTerminal(estado)).toBe(true);
    },
  );

  it('esEstadoTerminal es false para un estado operativo', () => {
    expect(policy.esEstadoTerminal(EstadoEnvio.EN_REPARTO)).toBe(false);
  });
});
