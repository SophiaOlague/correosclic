import bcrypt from 'bcrypt';
import {
  EstadoSolicitudVendedor,
  PasoSolicitudVendedor,
  PrismaClient,
} from '@prisma/client';

const PASSWORD = 'Correos123*';

export async function seedUsers(prisma: PrismaClient) {
  console.log('👥 Seeding usuarios...');

  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  /*
  |--------------------------------------------------------------------------
  | ROLES
  |--------------------------------------------------------------------------
  */

  const [
    rolCliente,
    rolVendedor,
    rolSuperAdmin,
  ] = await Promise.all([
    prisma.rol.findUniqueOrThrow({
      where: {
        codigo: 'CLIENTE',
      },
    }),

    prisma.rol.findUniqueOrThrow({
      where: {
        codigo: 'VENDEDOR',
      },
    }),

    prisma.rol.findUniqueOrThrow({
      where: {
        codigo: 'SUPER_ADMIN',
      },
    }),
  ]);

  /*
  |--------------------------------------------------------------------------
  | SUPER ADMIN
  |--------------------------------------------------------------------------
  */

  const admin = await prisma.usuario.upsert({
    where: {
      email: 'admin@correosclic.mx',
    },
    update: {
      nombre: 'Super',
      apellidoPaterno: 'Administrador',
      apellidoMaterno: '',
      telefono: '6181000000',
      emailVerificado: true,
      activo: true,
    },
    create: {
      email: 'admin@correosclic.mx',
      passwordHash,
      nombre: 'Super',
      apellidoPaterno: 'Administrador',
      apellidoMaterno: '',
      telefono: '6181000000',
      emailVerificado: true,
      activo: true,
    },
  });

  const adminRole = await prisma.usuarioRol.findFirst({
    where: {
      usuarioId: admin.id,
      rolId: rolSuperAdmin.id,
    },
  });

  if (!adminRole) {
    await prisma.usuarioRol.create({
      data: {
        usuarioId: admin.id,
        rolId: rolSuperAdmin.id,
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | CLIENTE
  |--------------------------------------------------------------------------
  */

  const clienteUsuario = await prisma.usuario.upsert({
    where: {
      email: 'cliente@correosclic.mx',
    },
    update: {
      nombre: 'Juan',
      apellidoPaterno: 'Pérez',
      apellidoMaterno: 'López',
      telefono: '6182000000',
      emailVerificado: true,
      activo: true,
    },
    create: {
      email: 'cliente@correosclic.mx',
      passwordHash,
      nombre: 'Juan',
      apellidoPaterno: 'Pérez',
      apellidoMaterno: 'López',
      telefono: '6182000000',
      emailVerificado: true,
      activo: true,
    },
  });

  const clienteRole = await prisma.usuarioRol.findFirst({
    where: {
      usuarioId: clienteUsuario.id,
      rolId: rolCliente.id,
    },
  });

  if (!clienteRole) {
    await prisma.usuarioRol.create({
      data: {
        usuarioId: clienteUsuario.id,
        rolId: rolCliente.id,
      },
    });
  }

  const cliente = await prisma.cliente.upsert({
    where: {
      usuarioId: clienteUsuario.id,
    },
    update: {
      activo: true,
    },
    create: {
      usuarioId: clienteUsuario.id,
      activo: true,
    },
  });
    /*
  |--------------------------------------------------------------------------
  | VENDEDOR
  |--------------------------------------------------------------------------
  */

  const vendedorUsuario = await prisma.usuario.upsert({
    where: {
      email: 'vendedor@correosclic.mx',
    },
    update: {
      nombre: 'María',
      apellidoPaterno: 'González',
      apellidoMaterno: 'Ramírez',
      telefono: '6183000000',
      emailVerificado: true,
      activo: true,
    },
    create: {
      email: 'vendedor@correosclic.mx',
      passwordHash,
      nombre: 'María',
      apellidoPaterno: 'González',
      apellidoMaterno: 'Ramírez',
      telefono: '6183000000',
      emailVerificado: true,
      activo: true,
    },
  });

  const vendedorClienteRole = await prisma.usuarioRol.findFirst({
    where: {
      usuarioId: vendedorUsuario.id,
      rolId: rolCliente.id,
    },
  });

  if (!vendedorClienteRole) {
    await prisma.usuarioRol.create({
      data: {
        usuarioId: vendedorUsuario.id,
        rolId: rolCliente.id,
      },
    });
  }

  const clienteVendedor = await prisma.cliente.upsert({
    where: {
      usuarioId: vendedorUsuario.id,
    },
    update: {
      activo: true,
    },
    create: {
      usuarioId: vendedorUsuario.id,
      activo: true,
    },
  });

  /*
  |--------------------------------------------------------------------------
  | SOLICITUD DE VENDEDOR
  |--------------------------------------------------------------------------
  */

  let solicitud = await prisma.solicitudVendedor.findFirst({
    where: {
      clienteId: clienteVendedor.id,
    },
  });

  if (!solicitud) {
    solicitud = await prisma.solicitudVendedor.create({
      data: {
        clienteId: clienteVendedor.id,
        estado: EstadoSolicitudVendedor.APROBADA,
        pasoActual: PasoSolicitudVendedor.FINALIZADA,
        fechaRevision: new Date(),
        comentariosRevision:
          'Solicitud aprobada automáticamente para desarrollo.',
      },
    });
  } else {
    solicitud = await prisma.solicitudVendedor.update({
      where: {
        id: solicitud.id,
      },
      data: {
        estado: EstadoSolicitudVendedor.APROBADA,
        pasoActual: PasoSolicitudVendedor.FINALIZADA,
        fechaRevision: new Date(),
        comentariosRevision:
          'Solicitud aprobada automáticamente para desarrollo.',
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | INFORMACIÓN FISCAL
  |--------------------------------------------------------------------------
  */

  await prisma.informacionFiscal.upsert({
    where: {
      solicitudVendedorId: solicitud.id,
    },
    update: {
      rfc: 'XAXX010101000',
      razonSocial: 'CorreosClic Demo',
      regimenFiscal: '626',
    },
    create: {
      solicitudVendedorId: solicitud.id,
      rfc: 'XAXX010101000',
      razonSocial: 'CorreosClic Demo',
      regimenFiscal: '626',
    },
  });

  /*
  |--------------------------------------------------------------------------
  | REGISTRO DE VENDEDOR
  |--------------------------------------------------------------------------
  */

  const estadoOperacion =
    await prisma.estadoProvincia.findFirstOrThrow({
      where: {
        nombre: 'Durango',
      },
    });

  const vendedor = await prisma.vendedor.upsert({
    where: {
      usuarioId: vendedorUsuario.id,
    },
    update: {
      solicitudAprobadaId: solicitud.id,
      estadoOperacionId: estadoOperacion.id,
      fechaAprobacion: new Date(),
      activo: true,
    },
    create: {
      usuarioId: vendedorUsuario.id,
      solicitudAprobadaId: solicitud.id,
      estadoOperacionId: estadoOperacion.id,
      fechaAprobacion: new Date(),
      activo: true,
    },
  });

  const vendedorRole = await prisma.usuarioRol.findFirst({
    where: {
      usuarioId: vendedorUsuario.id,
      rolId: rolVendedor.id,
    },
  });

  if (!vendedorRole) {
    await prisma.usuarioRol.create({
      data: {
        usuarioId: vendedorUsuario.id,
        rolId: rolVendedor.id,
      },
    });
  }
    /*
  |--------------------------------------------------------------------------
  | FINALIZACIÓN
  |--------------------------------------------------------------------------
  */

  console.log('   ✅ Super Admin creado');
  console.log('   ✅ Cliente creado');
  console.log('   ✅ Vendedor creado');

  return {
    admin,
    clienteUsuario,
    cliente,
    vendedorUsuario,
    vendedor,
    solicitud,
  };
}