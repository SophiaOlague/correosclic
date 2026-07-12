import { IsEnum, IsString, MaxLength } from 'class-validator';
import { TipoDocumentoVendedor } from '@correosclic/database';

export class UploadSellerDocumentDto {

  @IsEnum(TipoDocumentoVendedor)
  readonly tipoDocumento: TipoDocumentoVendedor;

  @IsString()
  @MaxLength(255)
  readonly nombreArchivo: string;

  @IsString()
  readonly urlArchivo: string;
}