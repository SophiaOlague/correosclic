import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateProductVariantDto {

  @IsString()
  readonly sku: string;

  @IsNumber()
  readonly precio: number;

  @IsOptional()
  @IsNumber()
  readonly pesoKg?: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', {
    each: true,
  })
  readonly valorAtributoIds: string[];

}