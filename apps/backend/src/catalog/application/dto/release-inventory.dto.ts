import {
  IsInt,
  Min,
} from 'class-validator';

export class ReleaseInventoryDto {

  @IsInt()
  @Min(1)
  readonly cantidad: number;

}