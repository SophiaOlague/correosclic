import { IsInt, IsUUID, Min } from 'class-validator';

export class AddShoppingCartItemDto {

  @IsUUID()
  productoVarianteId: string;

  @IsInt()
  @Min(1)
  cantidad: number;

}