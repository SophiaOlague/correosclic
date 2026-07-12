import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EstadoSolicitudVendedor, PasoSolicitudVendedor } from '@correosclic/database';
@Injectable()
export class AdminSellerRepository {

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findPendingRequests() {

    return this.prisma.solicitudVendedor.findMany({

      where: {
        estado: EstadoSolicitudVendedor.PENDIENTE,
        pasoActual: PasoSolicitudVendedor.REVISION,
      },

      include: {
        cliente: {
          include: {
            usuario: true,
          },
        },

        informacionFiscal: true,

        documentos: true,
      },

      orderBy: {
        createdAt: 'asc',
      },
    });
  }
//Ver a detalle solicitud
async findRequestById(id: string) {
  return this.prisma.solicitudVendedor.findUnique({
    where: {
      id,
    },
    include: {
      cliente: {
        include: {
          usuario: true,
        },
      },
      informacionFiscal: true,
      documentos: true,
    },
  });
}
//aprovar solicitud con pasos previos
async findSellerRole() {
  return this.prisma.rol.findUnique({
    where: {
      codigo: 'VENDEDOR',
    },
  });
}
async userAlreadyHasRole(
  usuarioId: string,
  rolId: string,
) {
  return this.prisma.usuarioRol.findUnique({
    where: {
      usuarioId_rolId: {
        usuarioId,
        rolId,
      },
    },
  });
}
//aprobar solicitud
async approveRequest(
  request: Awaited<ReturnType<AdminSellerRepository['findRequestById']>>,
  sellerRole: { id: string },
  alreadyHasRole: unknown,
) {
  return this.prisma.$transaction(async (tx) => {

    if (!request) {
      throw new Error('La solicitud no existe.');
    }

    if (!alreadyHasRole) {
      await tx.usuarioRol.create({
        data: {
          usuarioId: request.cliente.usuarioId,
          rolId: sellerRole.id,
        },
      });
    }

    await tx.vendedor.create({
      data: {
        usuarioId: request.cliente.usuarioId,
        solicitudAprobadaId: request.id,
        fechaAprobacion: new Date(),
      },
    });

    return tx.solicitudVendedor.update({
      where: {
        id: request.id,
      },
      data: {
        estado: 'APROBADA',
        pasoActual: 'FINALIZADA',
        fechaRevision: new Date(),
      },
    });
  });
}
//rechazar solicitud
async rejectRequest(
  requestId: string,
  comentariosRevision: string,
) {
  return this.prisma.solicitudVendedor.update({
    where: {
      id: requestId,
    },
    data: {
      estado: 'RECHAZADA',
      pasoActual: 'FINALIZADA',
      comentariosRevision,
      fechaRevision: new Date(),
    },
  });
}
}