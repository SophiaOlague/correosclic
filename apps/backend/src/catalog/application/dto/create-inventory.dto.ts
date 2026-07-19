import {
  IsInt,
  Min,
} from 'class-validator';

export class CreateInventoryDto {

  @IsInt()
  @Min(0)
  readonly stockDisponible: number;

  @IsInt()
  @Min(0)
  readonly stockMinimo: number;

}