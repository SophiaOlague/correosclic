import {
  IsInt,
  Min,
} from 'class-validator';

export class ReserveInventoryDto {

  @IsInt()
  @Min(1)
  readonly cantidad: number;

}