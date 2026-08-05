import {
  EstadoSolicitudVendedor,
  PasoSolicitudVendedor,
  TipoDocumentoVendedor,
} from '@correosclic/database';

export class SellerRequestFiscalInformationDto {
  rfc!: string;
  razonSocial!: string;
  regimenFiscal!: string;
}

export class SellerRequestDocumentDto {
  tipoDocumento!: TipoDocumentoVendedor;
  nombreArchivo!: string;
  urlArchivo!: string;
  createdAt!: Date;
}

/**
 * Estado completo de la solicitud de vendedor de quien la pide.
 *
 * `pasoActual` es la fuente de verdad del avance del onboarding: lo escribe el
 * propio backend al registrar la información fiscal y los documentos, así que
 * el cliente no tiene que llevar la cuenta por su lado ni conservar el
 * `requestId` entre recargas.
 */
export class SellerRequestResponseDto {
  id!: string;
  estado!: EstadoSolicitudVendedor;
  pasoActual!: PasoSolicitudVendedor;
  /** Motivo que dejó el revisor al rechazarla. */
  comentariosRevision!: string | null;
  fechaRevision!: Date | null;
  createdAt!: Date;
  informacionFiscal!: SellerRequestFiscalInformationDto | null;
  documentos!: SellerRequestDocumentDto[];
}
