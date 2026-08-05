import { Injectable, NotFoundException } from '@nestjs/common';

import { SellerOnboardingRepository } from '../../infrastructure/repositories/seller-onboarding.repository';

import { PendingSellerRequestException } from '../../domain/exceptions/pending-seller-request.exception';
import { SellerRequestNotFoundException } from '../../domain/exceptions/seller-request-not-found.exception';
import { FiscalInformationAlreadyExistsException } from '../../domain/exceptions/fiscal-information-already-exists.exception';
import { CreateFiscalInformationDto } from '../dto/create-fiscal-information.dto';
import { DocumentAlreadyExistsException } from '../../domain/exceptions/document-already-exists.exception';
import { UploadSellerDocumentDto } from '../dto/upload-seller-document.dto';
import { IncompleteSellerRequestException } from 'src/seller/domain/exceptions/incomplete-seller-request.exception';
import { TipoDocumentoVendedor } from '@correosclic/database';
import { ConflictException } from '@nestjs/common/exceptions/conflict.exception';
import { StoreAlreadyExistsException } from 'src/seller/domain/exceptions/store-already-exists.exception';
import { CreateStoreDto } from '../dto/create-store.dto';
import { SellerNotFoundException } from 'src/seller/domain/exceptions/seller-not-found.exception';
import { SellerRequestNotOwnedException } from 'src/seller/domain/exceptions/seller-request-not-owned.exception';
import { StoreNotFoundException } from 'src/seller/domain/exceptions/store-not-found.exception';
import { SellerRequestResponseDto } from '../dto/seller-request-response.dto';
import { SellerStoreResponseDto } from '../dto/seller-store-response.dto';

@Injectable()
export class SellerOnboardingService {
  constructor(
    private readonly repository: SellerOnboardingRepository,
  ) {}

  /**
   * Solicitud vigente del usuario autenticado.
   *
   * Es lo que permite reanudar el onboarding: sin esto, al recargar la página
   * se perdía el `requestId` y `createRequest` respondía 409 por la solicitud
   * pendiente, dejando al usuario sin salida.
   *
   * Responde 404 cuando nunca ha solicitado nada, que para la interfaz no es
   * un fallo sino el punto de partida.
   */
  async findMyRequest(
    userId: string,
  ): Promise<SellerRequestResponseDto> {

    const client =
      await this.repository.findClientByUserId(userId);

    if (!client) {
      throw new SellerRequestNotFoundException();
    }

    const request =
      await this.repository.findLatestRequestByClientId(
        client.id,
      );

    if (!request) {
      throw new SellerRequestNotFoundException();
    }

    return {
      id: request.id,
      estado: request.estado,
      pasoActual: request.pasoActual,
      comentariosRevision: request.comentariosRevision,
      fechaRevision: request.fechaRevision,
      createdAt: request.createdAt,

      informacionFiscal: request.informacionFiscal
        ? {
            rfc: request.informacionFiscal.rfc,
            razonSocial: request.informacionFiscal.razonSocial,
            regimenFiscal: request.informacionFiscal.regimenFiscal,
          }
        : null,

      documentos: request.documentos.map((document) => ({
        tipoDocumento: document.tipoDocumento,
        nombreArchivo: document.nombreArchivo,
        urlArchivo: document.urlArchivo,
        createdAt: document.createdAt,
      })),
    };
  }

  /** Tienda del vendedor autenticado. 404 si aún no es vendedor o no la ha creado. */
  async findMyStore(
    userId: string,
  ): Promise<SellerStoreResponseDto> {

    const seller =
      await this.repository.findSellerByUserId(userId);

    if (!seller) {
      throw new SellerNotFoundException();
    }

    const store =
      await this.repository.findStoreBySellerId(seller.id);

    if (!store) {
      throw new StoreNotFoundException();
    }

    return {
      id: store.id,
      codigoPublico: store.codigoPublico,
      nombre: store.nombre,
      descripcion: store.descripcion,
      logoUrl: store.logoUrl,
      activa: store.activa,
      createdAt: store.createdAt,
    };
  }

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

  /**
   * Toda operación sobre una solicitud se acota a su dueño.
   *
   * Sin esto, `requestId` viajaba en la URL sin ninguna comprobación: cualquier
   * usuario autenticado podía escribir el RFC y la razón social de otra
   * persona, subirle documentos o enviar su solicitud a revisión.
   */
  private async findOwnRequestOrThrow(
    userId: string,
    requestId: string,
  ) {

    const client =
      await this.repository.findClientByUserId(userId);

    if (!client) {
      throw new SellerRequestNotOwnedException();
    }

    const request =
      await this.repository.findRequestById(requestId);

    if (!request) {
      throw new SellerRequestNotFoundException();
    }

    if (request.clienteId !== client.id) {
      throw new SellerRequestNotOwnedException();
    }

    return request;
  }

  async addFiscalInformation(
  userId: string,
  requestId: string,
  dto: CreateFiscalInformationDto,
) {

  const request =
    await this.findOwnRequestOrThrow(userId, requestId);

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
  userId: string,
  requestId: string,
  dto: UploadSellerDocumentDto,
) {

  await this.findOwnRequestOrThrow(userId, requestId);

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
  userId: string,
  requestId: string,
) {

  const request =
    await this.findOwnRequestOrThrow(userId, requestId);

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
//crear tienda
async createStore(
  userId: string,
  dto: CreateStoreDto,
) {

  const seller =
    await this.repository.findSellerByUserId(userId);

  if (!seller) {
    throw new SellerNotFoundException();
  }

  const store =
    await this.repository.findStoreBySellerId(
      seller.id,
    );

  if (store) {
    throw new StoreAlreadyExistsException();
  }

  return this.repository.createStore(
    seller.id,
    {
      codigoPublico: this.generateStoreCode(),
      nombre: dto.nombre,
      descripcion: dto.descripcion,
    },
  );
}
  private generateStoreCode(): string {

    const random = Math.floor(
      100000 + Math.random() * 900000,
    );

    return `CCS-${random}`;
  }
}