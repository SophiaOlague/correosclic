import { PrismaClient } from '@prisma/client';

export async function seedAddresses(prisma: PrismaClient) {
  console.log('📍 Seeding direcciones...');

  const pais = await prisma.pais.findUniqueOrThrow({
    where: {
      codigoIso2: 'MX',
    },
  });

  const estado = await prisma.estadoProvincia.findFirstOrThrow({
    where: {
      nombre: 'Durango',
    },
  });

  const ciudad = await prisma.ciudad.findFirstOrThrow({
    where: {
      nombre: 'Durango',
      estadoProvinciaId: estado.id,
    },
  });

  const codigoPostal = await prisma.codigoPostal.findFirstOrThrow({
    where: {
      codigo: '34000',
      ciudadId: ciudad.id,
    },
  });

  const clienteUsuario = await prisma.usuario.findUniqueOrThrow({
    where: {
      email: 'cliente@correosclic.mx',
    },
    include: {
      cliente: true,
    },
  });

  const vendedorUsuario = await prisma.usuario.findUniqueOrThrow({
    where: {
      email: 'vendedor@correosclic.mx',
    },
    include: {
      cliente: true,
    },
  });

  if (!clienteUsuario.cliente) {
    throw new Error('Cliente no encontrado.');
  }

  if (!vendedorUsuario.cliente) {
    throw new Error('Cliente del vendedor no encontrado.');
  }

  /*
  |--------------------------------------------------------------------------
  | DIRECCIÓN DEL CLIENTE
  |--------------------------------------------------------------------------
  */

  let direccionCliente = await prisma.direccion.findFirst({
    where: {
      alias: 'Casa',
      calle: 'Av. 20 de Noviembre',
      numeroExterior: '100',
    },
  });

  if (!direccionCliente) {
    direccionCliente = await prisma.direccion.create({
      data: {
        paisId: pais.id,
        estadoProvinciaId: estado.id,
        ciudadId: ciudad.id,
        codigoPostalId: codigoPostal.id,

        alias: 'Casa',

        calle: 'Av. 20 de Noviembre',
        numeroExterior: '100',
        numeroInterior: null,
        colonia: 'Centro',
        referencias: 'Frente a la plaza principal',

        direccionFormateada:
          'Av. 20 de Noviembre 100, Centro, Durango, Dgo.',

        latitud: codigoPostal.latitud!,
        longitud: codigoPostal.longitud!,
      },
    });
  }

  const relacionCliente =
    await prisma.direccionCliente.findFirst({
      where: {
        clienteId: clienteUsuario.cliente.id,
        direccionId: direccionCliente.id,
      },
    });

  if (!relacionCliente) {
    await prisma.direccionCliente.create({
      data: {
        clienteId: clienteUsuario.cliente.id,
        direccionId: direccionCliente.id,
        esPrincipal: true,
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | SEGUNDA DIRECCIÓN DEL CLIENTE (no principal, para probar selección)
  |--------------------------------------------------------------------------
  */

  const estadoJalisco =
    await prisma.estadoProvincia.findFirstOrThrow({
      where: {
        nombre: 'Jalisco',
      },
    });

  const ciudadGuadalajara = await prisma.ciudad.findFirstOrThrow(
    {
      where: {
        nombre: 'Guadalajara',
        estadoProvinciaId: estadoJalisco.id,
      },
    },
  );

  const codigoPostalGuadalajara =
    await prisma.codigoPostal.findFirstOrThrow({
      where: {
        codigo: '44100',
        ciudadId: ciudadGuadalajara.id,
      },
    });

  let direccionOficinaCliente =
    await prisma.direccion.findFirst({
      where: {
        alias: 'Oficina',
        calle: 'Av. Chapultepec',
        numeroExterior: '250',
      },
    });

  if (!direccionOficinaCliente) {
    direccionOficinaCliente = await prisma.direccion.create({
      data: {
        paisId: pais.id,
        estadoProvinciaId: estadoJalisco.id,
        ciudadId: ciudadGuadalajara.id,
        codigoPostalId: codigoPostalGuadalajara.id,

        alias: 'Oficina',

        calle: 'Av. Chapultepec',
        numeroExterior: '250',
        numeroInterior: '4',
        colonia: 'Americana',
        referencias: 'Edificio de cristal, planta baja',

        direccionFormateada:
          'Av. Chapultepec 250-4, Americana, Guadalajara, Jal.',

        latitud: codigoPostalGuadalajara.latitud!,
        longitud: codigoPostalGuadalajara.longitud!,
      },
    });
  }

  const relacionOficinaCliente =
    await prisma.direccionCliente.findFirst({
      where: {
        clienteId: clienteUsuario.cliente.id,
        direccionId: direccionOficinaCliente.id,
      },
    });

  if (!relacionOficinaCliente) {
    await prisma.direccionCliente.create({
      data: {
        clienteId: clienteUsuario.cliente.id,
        direccionId: direccionOficinaCliente.id,
        esPrincipal: false,
      },
    });
  }

    /*
  |--------------------------------------------------------------------------
  | DIRECCIÓN DEL VENDEDOR
  |--------------------------------------------------------------------------
  */

  let direccionVendedor = await prisma.direccion.findFirst({
    where: {
      alias: 'Negocio',
      calle: 'Blvd. Felipe Pescador',
      numeroExterior: '500',
    },
  });

  if (!direccionVendedor) {
    direccionVendedor = await prisma.direccion.create({
      data: {
        paisId: pais.id,
        estadoProvinciaId: estado.id,
        ciudadId: ciudad.id,
        codigoPostalId: codigoPostal.id,

        alias: 'Negocio',

        calle: 'Blvd. Felipe Pescador',
        numeroExterior: '500',
        numeroInterior: null,
        colonia: 'Zona Centro',
        referencias: 'Frente a Soriana Centro',

        direccionFormateada:
          'Blvd. Felipe Pescador 500, Zona Centro, Durango, Dgo.',

        latitud: codigoPostal.latitud!,
        longitud: codigoPostal.longitud!,
      },
    });
  }

  const relacionVendedor =
    await prisma.direccionCliente.findFirst({
      where: {
        clienteId: vendedorUsuario.cliente.id,
        direccionId: direccionVendedor.id,
      },
    });

  if (!relacionVendedor) {
    await prisma.direccionCliente.create({
      data: {
        clienteId: vendedorUsuario.cliente.id,
        direccionId: direccionVendedor.id,
        esPrincipal: true,
      },
    });
  }

  console.log('   ✅ Dirección del cliente creada');
  console.log(
    '   ✅ Segunda dirección del cliente (Guadalajara) creada',
  );
  console.log('   ✅ Dirección del vendedor creada');

  return {
    clienteDireccion: direccionCliente,
    clienteDireccionOficina: direccionOficinaCliente,
    vendedorDireccion: direccionVendedor,
  };
}