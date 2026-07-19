import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateCategoryDto {

  @IsString()
  @MaxLength(150)
  readonly nombre: string;

  @IsString()
  @MaxLength(150)
  @Matches(/^[a-z0-9-]+$/)
  readonly slug: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly descripcion?: string;

  @IsOptional()
  @IsString()
  readonly parentId?: string;
}