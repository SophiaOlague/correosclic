/**
 * El backend devuelve importes como números decimales en MXN, con IVA ya
 * incluido (ver `CheckoutSummaryDto.ivaIncluido`). El diseño los muestra con
 * el formato "$2,499 MXN".
 */
const MXN = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const MXN_WITH_CENTS = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(amount: number, options?: { cents?: boolean }): string {
  const formatter = options?.cents ? MXN_WITH_CENTS : MXN;

  return `${formatter.format(amount)} MXN`;
}

const INTEGER = new Intl.NumberFormat('es-MX');

export function formatNumber(value: number): string {
  return INTEGER.format(value);
}

/** Porcentaje de descuento respecto al precio anterior, redondeado. */
export function discountPercentage(price: number, previousPrice?: number): number | null {
  if (!previousPrice || previousPrice <= price) return null;

  return Math.round(((previousPrice - price) / previousPrice) * 100);
}
