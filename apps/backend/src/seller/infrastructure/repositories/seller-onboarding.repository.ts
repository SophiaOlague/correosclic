import { Injectable } from '@nestjs/common';
import {
  PrismaService,
} from '../../../prisma/prisma.service';

import { TipoDocumentoVendedor } from '@correosclic/database';

@Injectable()
export class SellerOnboardingRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findClientByUserId(userId: string) {
    return this.prisma.cliente.findUnique({
      where: {
        usuarioId: userId,
      },
    });
  }

  async findPendingRequest(clienteId: string) {
    return this.prisma.solicitudVendedor.findFirst({
      where: {
        clienteId,
        estado: 'PENDIENTE',
      },
    });
  }

  async createRequest(clienteId: string) {
    return this.prisma.solicitudVendedor.create({
      data: {
        clienteId,
      },
    });
  }

  async findRequestById(id: string) {
    return this.prisma.solicitudVendedor.findUnique({
      where: {
        id,
      },
      include: {
        informacionFiscal: true,
        documentos: true,
      },
    });
  }

  async createFiscalInformation(
    requestId: string,
    data: {
      rfc: string;
      razonSocial: string;
      regimenFiscal: string;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {

      await tx.informacionFiscal.create({
        data: {
          solicitudVendedorId: requestId,
          rfc: data.rfc,
          razonSocial: data.razonSocial,
          regimenFiscal: data.regimenFiscal,
        },
      });

      return tx.solicitudVendedor.update({
        where: {
          id: requestId,
        },
        data: {
          pasoActual: 'INFORMACION_FISCAL',
        },
        include: {
          informacionFiscal: true,
        },
      });
    });
  }

  async findDocument(
    requestId: string,
    tipoDocumento: TipoDocumentoVendedor,
  ) {
    return this.prisma.documentoVendedor.findFirst({
      where: {
        solicitudVendedorId: requestId,
        tipoDocumento,
      },
    });
  }

  async addDocument(
    requestId: string,
    data: {
      tipoDocumento: TipoDocumentoVendedor;
      nombreArchivo: string;
      urlArchivo: string;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {

      await tx.documentoVendedor.create({
        data: {
          solicitudVendedorId: requestId,
          tipoDocumento: data.tipoDocumento,
          nombreArchivo: data.nombreArchivo,
          urlArchivo: data.urlArchivo,
        },
      });

      const documents = await tx.documentoVendedor.findMany({
        where: {
          solicitudVendedorId: requestId,
        },
        select: {
          tipoDocumento: true,
        },
      });

      const uploadedDocuments = new Set(
        documents.map(document => document.tipoDocumento),
      );

      const requiredDocuments = [
        TipoDocumentoVendedor.INE,
        TipoDocumentoVendedor.CONSTANCIA_SITUACION_FISCAL,
        TipoDocumentoVendedor.COMPROBANTE_DOMICILIO,
      ];

      const allRequiredUploaded =
        requiredDocuments.every(document =>
          uploadedDocuments.has(document),
        );

      return tx.solicitudVendedor.update({
        where: {
          id: requestId,
        },
        data: {
          pasoActual: allRequiredUploaded
            ? 'REVISION'
            : 'DOCUMENTOS',
        },
        include: {
          documentos: true,
        },
      });
    });
  }
  async submitRequest(
  requestId: string,
) {
  return this.prisma.solicitudVendedor.update({
    where: {
      id: requestId,
    },
    data: {
      pasoActual: 'REVISION',
    },
  });
}
//Buscar vendedor por usuario
async findSellerByUserId(
  userId: string,
) {
  return this.prisma.vendedor.findUnique({
    where: {
      usuarioId: userId,
    },
  });
}
//Buscar tienda
async findStoreBySellerId(
  vendedorId: string,
) {
  return this.prisma.tienda.findUnique({
    where: {
      vendedorId,
    },
  });
}
//Crear tienda
async createStore(
  vendedorId: string,
  data: {
    codigoPublico: string;
    nombre: string;
    descripcion?: string;
  },
) {
  return this.prisma.tienda.create({
    data: {
      vendedorId,
      codigoPublico: data.codigoPublico,
      nombre: data.nombre,
      descripcion: data.descripcion,
    },
  });
}
private generateStoreCode(): string {

  const random = Math.floor(
    100000 + Math.random() * 900000,
  );

  return `CCS-${random}`;
}
}