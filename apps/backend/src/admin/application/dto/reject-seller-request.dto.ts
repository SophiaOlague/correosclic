import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class RejectSellerRequestDto {

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  readonly comentariosRevision: string;

}