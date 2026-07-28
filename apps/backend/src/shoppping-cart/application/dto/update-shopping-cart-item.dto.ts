import { IsInt, Min } from 'class-validator';

export class UpdateShoppingCartItemDto {
  @IsInt()
  @Min(1)
  cantidad: number;
}