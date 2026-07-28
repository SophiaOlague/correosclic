import { IsOptional, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @IsOptional()
  @IsUUID()
  direccionId?: string;
}
