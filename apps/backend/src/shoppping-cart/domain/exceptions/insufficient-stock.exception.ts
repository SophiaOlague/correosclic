import { BadRequestException } from '@nestjs/common';

export class InsufficientStockException extends BadRequestException {
  constructor(stockDisponible: number) {
    super(
      `Stock insuficiente. Solo hay ${stockDisponible} unidades disponibles.`,
    );
  }
}