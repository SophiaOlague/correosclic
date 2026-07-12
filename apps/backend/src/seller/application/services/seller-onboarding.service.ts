import { Injectable, NotFoundException } from '@nestjs/common';

import { SellerOnboardingRepository } from '../../infrastructure/repositories/seller-onboarding.repository';

import { PendingSellerRequestException } from '../../domain/exceptions/pending-seller-request.exception';
import { SellerRequestNotFoundException } from '../../domain/exceptions/seller-request-not-found.exception';
import { FiscalInformationAlreadyExistsException } from '../../infrastructure/repositories/fiscal-information-already-exists.exception';
import { CreateFiscalInformationDto } from '../dto/create-fiscal-information.dto';
import { DocumentAlreadyExistsException } from '../../domain/exceptions/document-already-exists.exception';
import { UploadSellerDocumentDto } from '../dto/upload-seller-document.dto';
import { IncompleteSellerRequestException } from 'src/seller/domain/exceptions/incomplete-seller-request.exception';
import { TipoDocumentoVendedor } from '@correosclic/database';
import { ConflictException } from '@nestjs/common/exceptions/conflict.exception';

@Injectable()
export class SellerOnboardingService {
  constructor(
    private readonly repository: SellerOnboardingRepository,
  ) {}

  async createRequest(userId: string) {

    const client =
      await this.repository.findClientByUserId(userId);

    if (!client) {
      throw new NotFoundException('Cliente no encontrado.');
    }

    const pending =
      await this.repository.findPendingRequest(client.id);

    if (pending) {
      throw new PendingSellerRequestException();
    }

    return this.repository.createRequest(client.id);
  }

  async addFiscalInformation(
  requestId: string,
  dto: CreateFiscalInformationDto,
) {

  const request =
    await this.repository.findRequestById(requestId);

  if (!request) {
    throw new SellerRequestNotFoundException();
  }

  if (request.informacionFiscal) {
    throw new FiscalInformationAlreadyExistsException();
  }

  return this.repository.createFiscalInformation(
    requestId,
    dto,
  );
}
//document upload
async addDocument(
  requestId: string,
  dto: UploadSellerDocumentDto,
) {

  const request =
    await this.repository.findRequestById(requestId);

  if (!request) {
    throw new SellerRequestNotFoundException();
  }

  const document =
    await this.repository.findDocument(
      requestId,
      dto.tipoDocumento,
    );

  if (document) {
    throw new DocumentAlreadyExistsException(
      dto.tipoDocumento,
    );
  }

  return this.repository.addDocument(
    requestId,
    dto,
  );
}
//validar documentos y enviar solicitud a revisión
async submitRequest(
  requestId: string,
) {

  const request =
    await this.repository.findRequestById(requestId);

  if (!request) {
    throw new SellerRequestNotFoundException();
  }

  if (!request.informacionFiscal) {
    throw new ConflictException(
      'Debe registrar la información fiscal antes de enviar la solicitud.',
    );
  }

  const requiredDocuments = [
    {
      tipo: TipoDocumentoVendedor.INE,
      nombre: 'INE',
    },
    {
      tipo: TipoDocumentoVendedor.CONSTANCIA_SITUACION_FISCAL,
      nombre: 'Constancia de Situación Fiscal',
    },
    {
      tipo: TipoDocumentoVendedor.COMPROBANTE_DOMICILIO,
      nombre: 'Comprobante de domicilio',
    },
  ];

  const uploadedDocuments = new Set(
    request.documentos.map(
      document => document.tipoDocumento,
    ),
  );

  const missingDocument = requiredDocuments.find(
    document => !uploadedDocuments.has(document.tipo),
  );

  if (missingDocument) {
    throw new ConflictException(
      `Falta subir el documento: ${missingDocument.nombre}.`,
    );
  }

  return this.repository.submitRequest(
    requestId,
  );
}
}