import bcrypt from 'bcrypt';
import {
  EstadoSolicitudVendedor,
  PasoSolicitudVendedor,
  PrismaClient,
} from '@prisma/client';

const PASSWORD = 'Correos123*';

interface VendorSeedData {
  email: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  telefono: string;
  estadoOperacion: string;
  rfc: string;
  razonSocial: string;
}

/**
 * Varios vendedores en distintos estados para poder probar el checkout
 * multivendedor (distintas zonas tarifarias) sin capturar datos a mano.
 */
const VENDEDORES: VendorSeedData[] = [
  {
    email: 'vendedor@correosclic.mx',
    nombre: 'María',
    apellidoPaterno: 'González',
    apellidoMaterno: 'Ramírez',
    telefono: '6183000000',
    estadoOperacion: 'Durango',
    rfc: 'XAXX010101000',
    razonSocial: 'CorreosClic Demo',
  },
  {
    email: 'vendedor2@correosclic.mx',
    nombre: 'Carlos',
    apellidoPaterno: 'Hernández',
    apellidoMaterno: 'Ibarra',
    telefono: '3312345678',
    estadoOperacion: 'Jalisco',
    rfc: 'XAXX010101001',
    razonSocial: 'CorreosClic Demo Jalisco',
  },
  {
    email: 'vendedor3@correosclic.mx',
    nombre: 'Diana',
    apellidoPaterno: 'Uc',
    apellidoMaterno: 'Cetina',
    telefono: '9981234567',
    estadoOperacion: 'Quintana Roo',
    rfc: 'XAXX010101002',
    razonSocial: 'CorreosClic Demo Quintana Roo',
  },
];

export async function seedUsers(prisma: PrismaClient) {
  console.log('👥 Seeding usuarios...');

  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  /*
  |--------------------------------------------------------------------------
  | ROLES
  |--------------------------------------------------------------------------
  */

  const [rolCliente, rolVendedor, rolSuperAdmin] =
    await Promise.all([
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
  | VENDEDORES
  |--------------------------------------------------------------------------
  */

  const vendedores = [];

  for (const data of VENDEDORES) {
    vendedores.push(
      await seedVendor(prisma, passwordHash, data, {
        rolCliente,
        rolVendedor,
      }),
    );
  }

  console.log('   ✅ Super Admin creado');
  console.log('   ✅ Cliente creado');
  console.log(
    `   ✅ ${vendedores.length} vendedores creados`,
  );

  return {
    admin,
    clienteUsuario,
    cliente,
    vendedores,
  };
}

async function seedVendor(
  prisma: PrismaClient,
  passwordHash: string,
  data: VendorSeedData,
  roles: {
    rolCliente: { id: string };
    rolVendedor: { id: string };
  },
) {
  const vendedorUsuario = await prisma.usuario.upsert({
    where: {
      email: data.email,
    },
    update: {
      nombre: data.nombre,
      apellidoPaterno: data.apellidoPaterno,
      apellidoMaterno: data.apellidoMaterno,
      telefono: data.telefono,
      emailVerificado: true,
      activo: true,
    },
    create: {
      email: data.email,
      passwordHash,
      nombre: data.nombre,
      apellidoPaterno: data.apellidoPaterno,
      apellidoMaterno: data.apellidoMaterno,
      telefono: data.telefono,
      emailVerificado: true,
      activo: true,
    },
  });

  const vendedorClienteRole =
    await prisma.usuarioRol.findFirst({
      where: {
        usuarioId: vendedorUsuario.id,
        rolId: roles.rolCliente.id,
      },
    });

  if (!vendedorClienteRole) {
    await prisma.usuarioRol.create({
      data: {
        usuarioId: vendedorUsuario.id,
        rolId: roles.rolCliente.id,
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

  await prisma.informacionFiscal.upsert({
    where: {
      solicitudVendedorId: solicitud.id,
    },
    update: {
      rfc: data.rfc,
      razonSocial: data.razonSocial,
      regimenFiscal: '626',
    },
    create: {
      solicitudVendedorId: solicitud.id,
      rfc: data.rfc,
      razonSocial: data.razonSocial,
      regimenFiscal: '626',
    },
  });

  const estadoOperacion =
    await prisma.estadoProvincia.findFirstOrThrow({
      where: {
        nombre: data.estadoOperacion,
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
      rolId: roles.rolVendedor.id,
    },
  });

  if (!vendedorRole) {
    await prisma.usuarioRol.create({
      data: {
        usuarioId: vendedorUsuario.id,
        rolId: roles.rolVendedor.id,
      },
    });
  }

  return {
    usuario: vendedorUsuario,
    cliente: clienteVendedor,
    solicitud,
    vendedor,
  };
}
