import { IsOptional, IsUUID } from 'class-validator';

export class CheckoutQueryDto {
  @IsOptional()
  @IsUUID()
  direccionId?: string;
}
