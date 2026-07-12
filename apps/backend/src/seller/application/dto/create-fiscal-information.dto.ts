import { IsString, MaxLength } from 'class-validator';

export class CreateFiscalInformationDto {
  @IsString()
  @MaxLength(20)
  readonly rfc: string;

  @IsString()
  @MaxLength(255)
  readonly razonSocial: string;

  @IsString()
  @MaxLength(255)
  readonly regimenFiscal: string;
}