import {
  IsString,
  IsUUID,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsUUID()
  readonly categoriaId: string;

  @IsString()
  @MaxLength(255)
  readonly nombre: string;

  @IsOptional()
  @IsString()
  readonly descripcion?: string;

  @IsNumber()
  @Min(0.001)
  readonly pesoKg: number;
}