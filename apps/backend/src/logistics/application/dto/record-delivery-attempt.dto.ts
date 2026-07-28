import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ResultadoIntentoEntrega } from '@correosclic/database';

export class RecordDeliveryAttemptDto {
  @IsEnum(ResultadoIntentoEntrega)
  resultado!: ResultadoIntentoEntrega;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  fotoIntentoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  nombreRecibe?: string;
}
