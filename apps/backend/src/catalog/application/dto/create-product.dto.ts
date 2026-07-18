import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {

  @IsUUID()
  readonly categoriaId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  readonly nombre: string;

  @IsString()
  @MaxLength(5000)
  readonly descripcion?: string;

  @IsNumber()
  @Min(0.001)
  readonly pesoKg: number;

}