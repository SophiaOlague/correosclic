import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateSystemConfigDto {
  /**
   * Valor de la clave, siempre como texto.
   *
   * `ConfiguracionSistema.valor` es `VarChar(255)` y cada consumidor lo
   * interpreta a su manera (`getNumber`, `getString`), así que aquí no se
   * convierte: se valida que sea un texto no vacío y quien lo lee decide.
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  readonly valor: string;
}
