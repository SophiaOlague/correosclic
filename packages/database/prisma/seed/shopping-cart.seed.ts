import { PrismaClient } from '@prisma/client';

export async function seedShoppingCart(prisma: PrismaClient) {
  console.log('🛒 Seeding carrito de compras...');

  /*
  |--------------------------------------------------------------------------
  | CLIENTE
  |--------------------------------------------------------------------------
  */

  const usuario = await prisma.usuario.findUniqueOrThrow({
    where: {
      email: 'cliente@correosclic.mx',
    },
    include: {
      cliente: true,
    },
  });

  if (!usuario.cliente) {
    throw new Error('No existe el cliente.');
  }

  /*
  |--------------------------------------------------------------------------
  | VARIANTES DEL CATÁLOGO
  |--------------------------------------------------------------------------
  */

  const mouseNegro = await prisma.productoVariante.findUniqueOrThrow({
    where: {
      sku: 'LOG-G203-BLK',
    },
  });

  const playeraBlancaM = await prisma.productoVariante.findUniqueOrThrow({
    where: {
      sku: 'CC-TEE-WHT-M',
    },
  });

  const libreta = await prisma.productoVariante.findUniqueOrThrow({
    where: {
      sku: 'NOTEBOOK-A5',
    },
  });

  /*
  |--------------------------------------------------------------------------
  | CARRITO
  |--------------------------------------------------------------------------
  */

  const carrito = await prisma.carrito.upsert({
    where: {
      clienteId: usuario.cliente.id,
    },
    update: {},
    create: {
      clienteId: usuario.cliente.id,
    },
  });

  /*
  |--------------------------------------------------------------------------
  | LIMPIAR ITEMS EXISTENTES
  |--------------------------------------------------------------------------
  */

  await prisma.carritoItem.deleteMany({
    where: {
      carritoId: carrito.id,
    },
  });
    /*
  |--------------------------------------------------------------------------
  | ITEMS DEL CARRITO
  |--------------------------------------------------------------------------
  */

  const items = [
    {
      varianteId: mouseNegro.id,
      cantidad: 1,
    },
    {
      varianteId: playeraBlancaM.id,
      cantidad: 2,
    },
    {
      varianteId: libreta.id,
      cantidad: 1,
    },
  ];

  for (const item of items) {
    await prisma.carritoItem.create({
      data: {
        carritoId: carrito.id,
        productoVarianteId: item.varianteId,
        cantidad: item.cantidad,
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | RESUMEN
  |--------------------------------------------------------------------------
  */

  const carritoCompleto = await prisma.carrito.findUniqueOrThrow({
    where: {
      id: carrito.id,
    },
    include: {
      items: {
        include: {
          productoVariante: {
            include: {
              producto: true,
              valores: {
                include: {
                  valorAtributo: {
                    include: {
                      atributo: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  console.log(
    `   ✓ Carrito creado con ${carritoCompleto.items.length} productos`
  );

  console.log('   ✓ Cliente: cliente@correosclic.mx');

  return {
    carrito,
    items: carritoCompleto.items,
  };
}