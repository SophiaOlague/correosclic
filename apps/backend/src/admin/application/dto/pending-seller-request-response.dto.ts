export class PendingSellerRequestResponseDto {
  readonly id: string;

  readonly nombreCompleto: string;

  readonly rfc: string;

  readonly fechaSolicitud: Date;

  readonly documentosCompletos: boolean;
}