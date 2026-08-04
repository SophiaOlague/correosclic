import { IsBoolean } from 'class-validator';

export class UpdateProductPublicationDto {
  @IsBoolean()
  readonly publicado: boolean;
}
