import { Injectable } from '@nestjs/common';

import { AdminSellerRepository } from '../../infrastructure/repositories/admin-seller.repository';

import { PendingSellerRequestResponseDto } from '../dto/pending-seller-request-response.dto';

import { SellerRequestDetailResponseDto } from '../dto/seller-request-detail-response.dto';
import { EstadoSolicitudVendedor } from '@correosclic/database';

import { SellerRequestNotFoundException } from '../../domain/exceptions/seller-request-not-found.exception';

import { SellerRequestAlreadyReviewedException } from '../../domain/exceptions/seller-request-already-reviewed.exception';

@Injectable()
export class AdminSellerService {
  constructor(
    private readonly repository: AdminSellerRepository,
  ) {}

  async findPendingRequests(): Promise<
    PendingSellerRequestResponseDto[]
  > {

    const requests =
      await this.repository.findPendingRequests();

    return requests.map((request) => ({

      id: request.id,

      nombreCompleto: [
        request.cliente.usuario.nombre,
        request.cliente.usuario.apellidoPaterno,
        request.cliente.usuario.apellidoMaterno,
      ]
        .filter(Boolean)
        .join(' '),

      rfc:
        request.informacionFiscal?.rfc ?? '',

      fechaSolicitud:
        request.createdAt,

      documentosCompletos:
        request.documentos.length === 3,

    }));
  }
  //ver a detalle solicitud
  async findRequestById(
  id: string,
): Promise<SellerRequestDetailResponseDto> {

  const request =
    await this.repository.findRequestById(id);

  if (!request) {
    throw new SellerRequestNotFoundException();
  }

  return {
    id: request.id,

    estado: request.estado,

    pasoActual: request.pasoActual,

    cliente: {
      nombreCompleto: [
        request.cliente.usuario.nombre,
        request.cliente.usuario.apellidoPaterno,
        request.cliente.usuario.apellidoMaterno,
      ]
        .filter(Boolean)
        .join(' '),

      email: request.cliente.usuario.email,

      telefono:
        request.cliente.usuario.telefono ?? undefined,
    },

    informacionFiscal: request.informacionFiscal
      ? {
          rfc: request.informacionFiscal.rfc,
          razonSocial:
            request.informacionFiscal.razonSocial,
          regimenFiscal:
            request.informacionFiscal.regimenFiscal,
        }
      : null,

    documentos: request.documentos.map(document => ({
      tipoDocumento: document.tipoDocumento,
      nombreArchivo: document.nombreArchivo,
      urlArchivo: document.urlArchivo,
    })),
  };
}
//aprobar solicitud
async approveRequest(
  requestId: string,
) {

  const request =
    await this.repository.findRequestById(requestId);

  if (!request) {
    throw new SellerRequestNotFoundException();
  }

  if (request.estado !== EstadoSolicitudVendedor.PENDIENTE) {
    throw new SellerRequestAlreadyReviewedException();
  }

  const sellerRole =
    await this.repository.findSellerRole();

  if (!sellerRole) {
    throw new Error(
      'El rol VENDEDOR no existe.',
    );
  }

  const alreadyHasRole =
    await this.repository.userAlreadyHasRole(
      request.cliente.usuarioId,
      sellerRole.id,
    );

  return this.repository.approveRequest(
    request,
    sellerRole,
    alreadyHasRole,
  );
}
//rechazar solicitud
async rejectRequest(
  requestId: string,
  comentariosRevision: string,
) {

  const request =
    await this.repository.findRequestById(requestId);

  if (!request) {
    throw new SellerRequestNotFoundException();
  }

  if (request.estado !== EstadoSolicitudVendedor.PENDIENTE) {
    throw new SellerRequestAlreadyReviewedException();
  }

  return this.repository.rejectRequest(
    requestId,
    comentariosRevision,
  );
}
}
