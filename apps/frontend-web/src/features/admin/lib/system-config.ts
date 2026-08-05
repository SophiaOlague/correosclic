import type { SystemConfigKey } from '@/types/admin';

/**
 * Qué hace realmente cada clave de `ConfiguracionSistema`.
 *
 * El texto no se inventa: sale de leer quién llama a
 * `SystemConfigRepository.getNumber` en `apps/backend/src`. Tres de las siete
 * claves están declaradas en `ConfiguracionSistemaKey` pero **ningún servicio
 * las lee todavía**, así que la interfaz lo dice en vez de dar a entender que
 * cambiarlas mueve algún cálculo.
 *
 * `PATCH /admin/system-config/:clave` escribe en la misma fila que leen esos
 * servicios en cada petición: no hay caché ni despliegue de por medio, el
 * cambio aplica al siguiente pedido que se cotice.
 */
export type SystemConfigFormat = 'porcentaje' | 'entero' | 'decimal' | 'texto';

export interface SystemConfigMeta {
  label: string;
  /** Qué cambia al tocarla, con el servicio que la lee. */
  impacto: string;
  /** Servicio del backend que la consume hoy; null si no la lee nadie. */
  consumidor: string | null;
  formato: SystemConfigFormat;
  /** Sufijo visual del campo. */
  unidad?: string;
}

export const SYSTEM_CONFIG_META: Record<SystemConfigKey, SystemConfigMeta> = {
  MARKETPLACE_COMMISSION: {
    label: 'Comisión del marketplace',
    impacto:
      'CheckoutService la aplica sobre el subtotal de cada vendedor para calcular la comisión que CorreosClic le descuenta. No la paga el cliente ni aparece en su resumen de compra.',
    consumidor: 'CheckoutService',
    formato: 'porcentaje',
    unidad: '%',
  },

  IVA_PERCENTAGE: {
    label: 'IVA',
    impacto:
      'CheckoutService lo usa para desglosar el IVA que ya viene incluido dentro del total. Cambiarlo mueve el importe de todo pedido que se cotice a partir de ahora.',
    consumidor: 'CheckoutService',
    formato: 'porcentaje',
    unidad: '%',
  },

  ADDITIONAL_VENDOR_SHIPPING_FACTOR: {
    label: 'Aportación de cada vendedor adicional al envío',
    impacto:
      'ShippingCalculatorService lo aplica en pedidos multivendedor: la tarifa más alta se cobra completa y cada vendedor adicional aporta este porcentaje de la suya (`recargoAplicado`).',
    consumidor: 'ShippingCalculatorService',
    formato: 'porcentaje',
    unidad: '%',
  },

  MAX_DELIVERY_ATTEMPTS: {
    label: 'Máximo de intentos de entrega',
    impacto:
      'LogisticsPlanningEngine lo consulta en cada intento fallido: al alcanzarlo, DeliveryRetryPolicy deja de reprogramar y el envío pasa a DEVUELTO.',
    consumidor: 'LogisticsPlanningEngine',
    formato: 'entero',
    unidad: 'intentos',
  },

  VOLUMETRIC_FACTOR: {
    label: 'Factor volumétrico',
    impacto:
      'Declarada en el dominio, pero hoy ningún servicio la lee: el cálculo de envío tarifica con el peso real de los artículos, no con el volumétrico.',
    consumidor: null,
    formato: 'decimal',
  },

  PAYMENT_TIMEOUT_MINUTES: {
    label: 'Tiempo máximo para completar un pago',
    impacto:
      'Declarada en el dominio, pero hoy ningún servicio la lee: Payments no expira los intentos de pago por su cuenta.',
    consumidor: null,
    formato: 'entero',
    unidad: 'minutos',
  },

  CURRENCY: {
    label: 'Moneda del sistema',
    impacto:
      'Declarada en el dominio, pero hoy ningún servicio la lee: los importes se formatean como MXN en la interfaz.',
    consumidor: null,
    formato: 'texto',
  },
};

/**
 * Orden de presentación: primero lo que sí mueve dinero o logística en vivo.
 * Las claves inertes van al final para que no compitan por la atención.
 */
export const SYSTEM_CONFIG_ORDER: readonly SystemConfigKey[] = [
  'MARKETPLACE_COMMISSION',
  'IVA_PERCENTAGE',
  'ADDITIONAL_VENDOR_SHIPPING_FACTOR',
  'MAX_DELIVERY_ATTEMPTS',
  'VOLUMETRIC_FACTOR',
  'PAYMENT_TIMEOUT_MINUTES',
  'CURRENCY',
];

export function isSystemConfigKey(clave: string): clave is SystemConfigKey {
  return clave in SYSTEM_CONFIG_META;
}

export function systemConfigMeta(clave: string): SystemConfigMeta | null {
  return isSystemConfigKey(clave) ? SYSTEM_CONFIG_META[clave] : null;
}
