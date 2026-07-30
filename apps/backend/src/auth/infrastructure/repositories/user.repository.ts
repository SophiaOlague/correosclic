import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';

type RegisterClientData = {
  email: string;
  passwordHash: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  telefono?: string | null;
};

@Injectable()
export class UserRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: {
        email,
      },
    });
  }

  async registerClient(
  data: RegisterClientData,
) {
  return this.prisma.$transaction(async (tx) => {

    const clientRole = await tx.rol.findUnique({
      where: {
        codigo: 'CLIENTE',
      },
    });

    if (!clientRole) {
      throw new Error('El rol CLIENTE no existe.');
    }

    const user = await tx.usuario.create({
  data: {
    email: data.email,
    passwordHash: data.passwordHash,
    nombre: data.nombre,
    apellidoPaterno: data.apellidoPaterno,
    apellidoMaterno: data.apellidoMaterno,
    telefono: data.telefono,
  },
});

    await tx.usuarioRol.create({
  data: {
    usuarioId: user.id,
    rolId: clientRole.id,
  },
});

    await tx.cliente.create({
  data: {
        usuarioId: user.id,
  },
});

    return user;
  });
}

async getRoles(userId: string): Promise<string[]> {
  const userRoles = await this.prisma.usuarioRol.findMany({
    where: {
      usuarioId: userId,
    },
    include: {
      rol: true,
    },
  });

  return userRoles.map((userRole) => userRole.rol.codigo);
}

async findByIdWithRoles(id: string) {
  return this.prisma.usuario.findUnique({
    where: {
      id,
    },
    include: {
      usuarioRoles: {
        include: {
          rol: true,
        },
      },
    },
  });
}

async findByEmailWithRoles(email: string) {
  return this.prisma.usuario.findUnique({
    where: {
      email,
    },
    include: {
      usuarioRoles: {
        include: {
          rol: true,
        },
      },
    },
  });
}
async findClientByUserId(userId: string) {
  return this.prisma.cliente.findUnique({
    where: {
      usuarioId: userId,
    },
    select: {
      id: true,
    },
  });
}
}