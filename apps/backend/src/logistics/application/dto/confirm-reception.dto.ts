import { IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class ConfirmReceptionDto {
  @IsString()
  @MaxLength(50)
  trackingInterno!: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  pesoRealKg?: number;
}
