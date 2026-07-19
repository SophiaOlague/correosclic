import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateProductVariantAttributeDto {

  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsString()
  @IsNotEmpty()
  readonly valor: string;

}