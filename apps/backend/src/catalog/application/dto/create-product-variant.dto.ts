import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import { CreateProductVariantAttributeDto }
from './create-product-variant-attribute.dto';

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
  @ValidateNested({
    each: true,
  })
  @Type(() => CreateProductVariantAttributeDto)
  readonly atributos: CreateProductVariantAttributeDto[];

}