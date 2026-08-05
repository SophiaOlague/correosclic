import { IsUUID } from 'class-validator';

export class ApproveSellerRequestDto {
  /**
   * Estado desde el que operará el vendedor.
   *
   * No es un dato administrativo cualquiera: `ShipmentCreationService` toma sus
   * coordenadas para elegir la sucursal de origen de cada envío. Un `Vendedor`
   * sin él deja sus pedidos pagados sin guía, en silencio, así que se exige al
   * aprobar en vez de dejarlo nulo.
   */
  @IsUUID()
  readonly estadoOperacionId: string;
}
