import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

import { ResultadoRecepcion } from '../../domain/resultado-recepcion';

export class ConfirmReceptionDto {
  @IsString()
  @MaxLength(50)
  trackingInterno!: string;

  /**
   * Omitirlo equivale a `ACEPTADO`, que es el flujo de siempre: quien ya
   * llamaba a este endpoint no necesita cambiar nada.
   */
  @IsOptional()
  @IsEnum(ResultadoRecepcion)
  resultado?: ResultadoRecepcion;

  /**
   * Obligatorio cuando se reporta daño o rechazo: un estado terminal no puede
   * quedar registrado sin el motivo que lo justifica.
   */
  @ValidateIf(
    (dto: ConfirmReceptionDto) =>
      dto.resultado !== undefined && dto.resultado !== ResultadoRecepcion.ACEPTADO,
  )
  @IsString({
    message: 'Las observaciones son obligatorias al reportar daño o rechazo.',
  })
  @MaxLength(500, {
    message: 'Las observaciones no pueden exceder 500 caracteres.',
  })
  observaciones?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  pesoRealKg?: number;
}
