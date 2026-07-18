import {
  IsInt,
  Min,
} from 'class-validator';

export class ConfirmInventoryDto {

  @IsInt()
  @Min(1)
  readonly cantidad: number;

}