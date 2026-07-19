export class SellerRequestDetailResponseDto {
  readonly id: string;

  readonly estado: string;

  readonly pasoActual: string;

  readonly cliente: {
    nombreCompleto: string;
    email: string;
    telefono?: string;
  };

  readonly informacionFiscal: {
    rfc: string;
    razonSocial: string;
    regimenFiscal: string;
  } | null;

  readonly documentos: {
    tipoDocumento: string;
    nombreArchivo: string;
    urlArchivo: string;
  }[];
}