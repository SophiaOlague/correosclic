import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateStoreDto {

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  readonly nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  readonly descripcion?: string;

}