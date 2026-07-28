export function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function roundWeight(amount: number): number {
  return Math.round(amount * 1000) / 1000;
}

export function roundDistance(amount: number): number {
  return Math.round(amount * 100) / 100;
}
