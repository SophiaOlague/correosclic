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
/**
 * Estados en los que un vendedor puede operar.
 *
 * Solo los activos y **con coordenadas**: sin ellas el motor logístico no
 * puede resolver la sucursal de origen y el envío nunca se crea.
 */
async findOperatingStates() {
  return this.prisma.estadoProvincia.findMany({
    where: {
      activo: true,
      latitud: { not: null },
      longitud: { not: null },
    },
    select: {
      id: true,
      nombre: true,
      codigo: true,
      region: { select: { id: true, nombre: true } },
    },
    orderBy: { nombre: 'asc' },
  });
}

async findStateById(id: string) {
  return this.prisma.estadoProvincia.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      activo: true,
      latitud: true,
      longitud: true,
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
  estadoOperacionId: string,
  revisorUsuarioId: string,
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
        // Sin esto el vendedor queda sin coordenadas de origen y sus pedidos
        // pagados nunca generan guía.
        estadoOperacionId,
      },
    });

    await tx.auditoria.create({
      data: {
        usuarioId: revisorUsuarioId,
        accion: 'APROBAR_SOLICITUD_VENDEDOR',
        entidad: 'SolicitudVendedor',
        entidadId: request.id,
        detalles: `Vendedor aprobado con estado de operación ${estadoOperacionId}.`,
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
  revisorUsuarioId: string,
) {
  return this.prisma.$transaction(async (tx) => {

    const solicitud = await tx.solicitudVendedor.update({
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

    await tx.auditoria.create({
      data: {
        usuarioId: revisorUsuarioId,
        accion: 'RECHAZAR_SOLICITUD_VENDEDOR',
        entidad: 'SolicitudVendedor',
        entidadId: requestId,
        detalles: comentariosRevision,
      },
    });

    return solicitud;
  });
}
}