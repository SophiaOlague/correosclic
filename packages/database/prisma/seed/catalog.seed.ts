import { PrismaClient } from '@prisma/client';

export async function seedCatalog(prisma: PrismaClient) {
  console.log('📦 Seeding catálogo...');

  /*
  |--------------------------------------------------------------------------
  | VENDEDOR
  |--------------------------------------------------------------------------
  */

  const vendedorUsuario = await prisma.usuario.findUniqueOrThrow({
    where: {
      email: 'vendedor@correosclic.mx',
    },
    include: {
      vendedor: true,
    },
  });

  if (!vendedorUsuario.vendedor) {
    throw new Error('No existe el vendedor.');
  }

  /*
  |--------------------------------------------------------------------------
  | TIENDA
  |--------------------------------------------------------------------------
  */

  const tienda = await prisma.tienda.upsert({
    where: {
      vendedorId: vendedorUsuario.vendedor.id,
    },
    update: {
      nombre: 'TechStore Durango',
      descripcion:
        'Tecnología y accesorios para oficina y gaming.',
      activa: true,
    },
    create: {
      vendedorId: vendedorUsuario.vendedor.id,
      codigoPublico: 'TECH-DGO',
      nombre: 'TechStore Durango',
      descripcion:
        'Tecnología y accesorios para oficina y gaming.',
      activa: true,
    },
  });

  /*
  |--------------------------------------------------------------------------
  | CATEGORÍAS RAÍZ
  |--------------------------------------------------------------------------
  */

  const electronica = await prisma.categoria.upsert({
    where: {
      slug: 'electronica',
    },
    update: {},
    create: {
      nombre: 'Electrónica',
      slug: 'electronica',
      descripcion: 'Productos electrónicos.',
    },
  });

  const oficina = await prisma.categoria.upsert({
    where: {
      slug: 'oficina',
    },
    update: {},
    create: {
      nombre: 'Oficina',
      slug: 'oficina',
      descripcion: 'Papelería y accesorios de oficina.',
    },
  });

  const ropa = await prisma.categoria.upsert({
    where: {
      slug: 'ropa',
    },
    update: {},
    create: {
      nombre: 'Ropa',
      slug: 'ropa',
      descripcion: 'Ropa y accesorios.',
    },
  });

  /*
  |--------------------------------------------------------------------------
  | SUBCATEGORÍAS ELECTRÓNICA
  |--------------------------------------------------------------------------
  */

  const mouse = await prisma.categoria.upsert({
    where: {
      slug: 'mouse',
    },
    update: {},
    create: {
      parentId: electronica.id,
      nombre: 'Mouse',
      slug: 'mouse',
    },
  });

  const teclados = await prisma.categoria.upsert({
    where: {
      slug: 'teclados',
    },
    update: {},
    create: {
      parentId: electronica.id,
      nombre: 'Teclados',
      slug: 'teclados',
    },
  });

  const audio = await prisma.categoria.upsert({
    where: {
      slug: 'audio',
    },
    update: {},
    create: {
      parentId: electronica.id,
      nombre: 'Audio',
      slug: 'audio',
    },
  });

  const monitores = await prisma.categoria.upsert({
    where: {
      slug: 'monitores',
    },
    update: {},
    create: {
      parentId: electronica.id,
      nombre: 'Monitores',
      slug: 'monitores',
    },
  });

  /*
  |--------------------------------------------------------------------------
  | SUBCATEGORÍAS OFICINA
  |--------------------------------------------------------------------------
  */

  const papeleria = await prisma.categoria.upsert({
    where: {
      slug: 'papeleria',
    },
    update: {},
    create: {
      parentId: oficina.id,
      nombre: 'Papelería',
      slug: 'papeleria',
    },
  });

  const accesorios = await prisma.categoria.upsert({
    where: {
      slug: 'accesorios-oficina',
    },
    update: {},
    create: {
      parentId: oficina.id,
      nombre: 'Accesorios',
      slug: 'accesorios-oficina',
    },
  });

  /*
  |--------------------------------------------------------------------------
  | SUBCATEGORÍAS ROPA
  |--------------------------------------------------------------------------
  */

  const playeras = await prisma.categoria.upsert({
    where: {
      slug: 'playeras',
    },
    update: {},
    create: {
      parentId: ropa.id,
      nombre: 'Playeras',
      slug: 'playeras',
    },
  });

  /*
  |--------------------------------------------------------------------------
  | ATRIBUTOS
  |--------------------------------------------------------------------------
  */

  const color = await prisma.atributo.upsert({
    where: {
      nombre: 'Color',
    },
    update: {},
    create: {
      nombre: 'Color',
    },
  });

  const talla = await prisma.atributo.upsert({
    where: {
      nombre: 'Tamaño',
    },
    update: {},
    create: {
      nombre: 'Tamaño',
    },
  });

  /*
  |--------------------------------------------------------------------------
  | VALORES COLOR
  |--------------------------------------------------------------------------
  */

  const negro = await prisma.valorAtributo.upsert({
    where: {
      atributoId_valor: {
        atributoId: color.id,
        valor: 'Negro',
      },
    },
    update: {},
    create: {
      atributoId: color.id,
      valor: 'Negro',
    },
  });

  const blanco = await prisma.valorAtributo.upsert({
    where: {
      atributoId_valor: {
        atributoId: color.id,
        valor: 'Blanco',
      },
    },
    update: {},
    create: {
      atributoId: color.id,
      valor: 'Blanco',
    },
  });

  const rojo = await prisma.valorAtributo.upsert({
    where: {
      atributoId_valor: {
        atributoId: color.id,
        valor: 'Rojo',
      },
    },
    update: {},
    create: {
      atributoId: color.id,
      valor: 'Rojo',
    },
  });

  const azul = await prisma.valorAtributo.upsert({
    where: {
      atributoId_valor: {
        atributoId: color.id,
        valor: 'Azul',
      },
    },
    update: {},
    create: {
      atributoId: color.id,
      valor: 'Azul',
    },
  });

  /*
  |--------------------------------------------------------------------------
  | VALORES TAMAÑO
  |--------------------------------------------------------------------------
  */

  const tallaS = await prisma.valorAtributo.upsert({
    where: {
      atributoId_valor: {
        atributoId: talla.id,
        valor: 'S',
      },
    },
    update: {},
    create: {
      atributoId: talla.id,
      valor: 'S',
    },
  });

  const tallaM = await prisma.valorAtributo.upsert({
    where: {
      atributoId_valor: {
        atributoId: talla.id,
        valor: 'M',
      },
    },
    update: {},
    create: {
      atributoId: talla.id,
      valor: 'M',
    },
  });

  const tallaL = await prisma.valorAtributo.upsert({
    where: {
      atributoId_valor: {
        atributoId: talla.id,
        valor: 'L',
      },
    },
    update: {},
    create: {
      atributoId: talla.id,
      valor: 'L',
    },
  });
    /*
  |--------------------------------------------------------------------------
  | PRODUCTOS
  |--------------------------------------------------------------------------
  */

  const mouseG203 = await prisma.producto.upsert({
    where: {
      codigoPublico: 'PROD-000001',
    },
    update: {},
    create: {
      tiendaId: tienda.id,
      categoriaId: mouse.id,

      codigoPublico: 'PROD-000001',

      nombre: 'Mouse Logitech G203 Lightsync',

      descripcion:
        'Mouse gamer Logitech G203 Lightsync con sensor de alta precisión y retroiluminación RGB.',

      pesoKg: 0.085,

      activo: true,
      publicado: true,
    },
  });

  const tecladoKumara = await prisma.producto.upsert({
    where: {
      codigoPublico: 'PROD-000002',
    },
    update: {},
    create: {
      tiendaId: tienda.id,
      categoriaId: teclados.id,

      codigoPublico: 'PROD-000002',

      nombre: 'Teclado Mecánico Redragon Kumara K552',

      descripcion:
        'Teclado mecánico compacto con switches Outemu y retroiluminación LED.',

      pesoKg: 0.860,

      activo: true,
      publicado: true,
    },
  });

  const hyperx = await prisma.producto.upsert({
    where: {
      codigoPublico: 'PROD-000003',
    },
    update: {},
    create: {
      tiendaId: tienda.id,
      categoriaId: audio.id,

      codigoPublico: 'PROD-000003',

      nombre: 'HyperX Cloud Stinger',

      descripcion:
        'Audífonos gamer HyperX Cloud Stinger con micrófono abatible.',

      pesoKg: 0.320,

      activo: true,
      publicado: true,
    },
  });

  const playeraCorreos = await prisma.producto.upsert({
    where: {
      codigoPublico: 'PROD-000004',
    },
    update: {},
    create: {
      tiendaId: tienda.id,
      categoriaId: playeras.id,

      codigoPublico: 'PROD-000004',

      nombre: 'Playera Oficial CorreosClic',

      descripcion:
        'Playera oficial de algodón con logotipo de CorreosClic.',

      pesoKg: 0.180,

      activo: true,
      publicado: true,
    },
  });

  const libreta = await prisma.producto.upsert({
    where: {
      codigoPublico: 'PROD-000005',
    },
    update: {},
    create: {
      tiendaId: tienda.id,
      categoriaId: papeleria.id,

      codigoPublico: 'PROD-000005',

      nombre: 'Libreta Profesional A5',

      descripcion:
        'Libreta profesional de pasta dura con 100 hojas.',

      pesoKg: 0.410,

      activo: true,
      publicado: true,
    },
  });

  /*
  |--------------------------------------------------------------------------
  | IMÁGENES
  |--------------------------------------------------------------------------
  */

  const imagenes = [
    {
      productoId: mouseG203.id,
      storageKey: 'products/logitech-g203.jpg',
      url: 'https://cdn.correosclic.dev/products/logitech-g203.jpg',
    },
    {
      productoId: tecladoKumara.id,
      storageKey: 'products/redragon-k552.jpg',
      url: 'https://cdn.correosclic.dev/products/redragon-k552.jpg',
    },
    {
      productoId: hyperx.id,
      storageKey: 'products/hyperx-cloud-stinger.jpg',
      url: 'https://cdn.correosclic.dev/products/hyperx-cloud-stinger.jpg',
    },
    {
      productoId: playeraCorreos.id,
      storageKey: 'products/playera-correosclic.jpg',
      url: 'https://cdn.correosclic.dev/products/playera-correosclic.jpg',
    },
    {
      productoId: libreta.id,
      storageKey: 'products/libreta-profesional.jpg',
      url: 'https://cdn.correosclic.dev/products/libreta-profesional.jpg',
    },
  ];

 for (const imagen of imagenes) {
  await prisma.productoImagen.deleteMany({
    where: {
      productoId: imagen.productoId,
    },
  });

  await prisma.productoImagen.create({
    data: {
      productoId: imagen.productoId,
      storageKey: imagen.storageKey,
      url: imagen.url,
      orden: 1,
      esPrincipal: true,
    },
  });
}
  /*
  |--------------------------------------------------------------------------
  | VARIANTES
  |--------------------------------------------------------------------------
  */

  const variantes = [
    // Logitech
    {
      productoId: mouseG203.id,
      sku: 'LOG-G203-BLK',
      precio: 499,
      pesoKg: 0.085,
      valores: [negro.id],
    },
    {
      productoId: mouseG203.id,
      sku: 'LOG-G203-WHT',
      precio: 499,
      pesoKg: 0.085,
      valores: [blanco.id],
    },

    // Kumara

    {
      productoId: tecladoKumara.id,
      sku: 'RED-K552-BLK',
      precio: 899,
      pesoKg: 0.860,
      valores: [negro.id],
    },

    {
      productoId: tecladoKumara.id,
      sku: 'RED-K552-WHT',
      precio: 899,
      pesoKg: 0.860,
      valores: [blanco.id],
    },

    // HyperX

    {
      productoId: hyperx.id,
      sku: 'HYP-STINGER-BLK',
      precio: 1099,
      pesoKg: 0.320,
      valores: [negro.id],
    },

    {
      productoId: hyperx.id,
      sku: 'HYP-STINGER-RED',
      precio: 1099,
      pesoKg: 0.320,
      valores: [rojo.id],
    },

    // Playera negra

    {
      productoId: playeraCorreos.id,
      sku: 'CC-TEE-BLK-S',
      precio: 299,
      pesoKg: 0.180,
      valores: [negro.id, tallaS.id],
    },

    {
      productoId: playeraCorreos.id,
      sku: 'CC-TEE-BLK-M',
      precio: 299,
      pesoKg: 0.180,
      valores: [negro.id, tallaM.id],
    },

    {
      productoId: playeraCorreos.id,
      sku: 'CC-TEE-BLK-L',
      precio: 299,
      pesoKg: 0.180,
      valores: [negro.id, tallaL.id],
    },

    // Playera blanca

    {
      productoId: playeraCorreos.id,
      sku: 'CC-TEE-WHT-S',
      precio: 299,
      pesoKg: 0.180,
      valores: [blanco.id, tallaS.id],
    },

    {
      productoId: playeraCorreos.id,
      sku: 'CC-TEE-WHT-M',
      precio: 299,
      pesoKg: 0.180,
      valores: [blanco.id, tallaM.id],
    },

    {
      productoId: playeraCorreos.id,
      sku: 'CC-TEE-WHT-L',
      precio: 299,
      pesoKg: 0.180,
      valores: [blanco.id, tallaL.id],
    },

    // Libreta

    {
      productoId: libreta.id,
      sku: 'NOTEBOOK-A5',
      precio: 149,
      pesoKg: 0.410,
      valores: [],
    },
  ];
    const variantesCreadas = [];

  for (const variante of variantes) {

    const creada = await prisma.productoVariante.upsert({

      where: {
        sku: variante.sku,
      },

      update: {
        precio: variante.precio,
        pesoKg: variante.pesoKg,
        activa: true,
      },

      create: {
        productoId: variante.productoId,
        sku: variante.sku,
        precio: variante.precio,
        pesoKg: variante.pesoKg,
        activa: true,
      },

    });

    await prisma.productoVarianteValor.deleteMany({

      where: {
        productoVarianteId: creada.id,
      },

    });

    for (const valor of variante.valores) {

      await prisma.productoVarianteValor.create({

        data: {

          productoVarianteId: creada.id,

          valorAtributoId: valor,

        },

      });

    }

    await prisma.inventario.upsert({

      where: {
        productoVarianteId: creada.id,
      },

      update: {

        stockDisponible: 50,

        stockReservado: 0,

        stockMinimo: 5,

      },

      create: {

        productoVarianteId: creada.id,

        stockDisponible: 50,

        stockReservado: 0,

        stockMinimo: 5,

      },

    });

    variantesCreadas.push(creada);

  }

  /*
  |--------------------------------------------------------------------------
  | TIENDAS/PRODUCTOS DE OTROS VENDEDORES (para probar checkout multivendedor)
  |--------------------------------------------------------------------------
  */

  const hogar = await prisma.categoria.upsert({
    where: {
      slug: 'hogar',
    },
    update: {},
    create: {
      nombre: 'Hogar',
      slug: 'hogar',
      descripcion: 'Artículos para el hogar.',
    },
  });

  const otrosVendedores = [
    {
      email: 'vendedor2@correosclic.mx',
      tienda: {
        codigoPublico: 'ELEC-JAL',
        nombre: 'Jalisco Electronics',
        descripcion: 'Electrónica y monitores.',
      },
      producto: {
        codigoPublico: 'PROD-000006',
        nombre: 'Monitor LG 24" Full HD',
        descripcion:
          'Monitor LG de 24 pulgadas, panel IPS, Full HD.',
        pesoKg: 3.5,
        categoriaId: monitores.id,
      },
      variante: {
        sku: 'LG-MON24-BLK',
        precio: 3499,
        pesoKg: 3.5,
        valores: [negro.id],
      },
      imagen: {
        storageKey: 'products/lg-monitor-24.jpg',
        url: 'https://cdn.correosclic.dev/products/lg-monitor-24.jpg',
      },
    },
    {
      email: 'vendedor3@correosclic.mx',
      tienda: {
        codigoPublico: 'HOGAR-ROO',
        nombre: 'Caribbean Crafts',
        descripcion: 'Artesanías y productos para el hogar.',
      },
      producto: {
        codigoPublico: 'PROD-000007',
        nombre: 'Hamaca Artesanal Yucateca',
        descripcion:
          'Hamaca tejida a mano, tamaño matrimonial.',
        pesoKg: 1.2,
        categoriaId: hogar.id,
      },
      variante: {
        sku: 'HAM-YUC-XL',
        precio: 899,
        pesoKg: 1.2,
        valores: [] as string[],
      },
      imagen: {
        storageKey: 'products/hamaca-artesanal.jpg',
        url: 'https://cdn.correosclic.dev/products/hamaca-artesanal.jpg',
      },
    },
  ];

  const productosOtrosVendedores = [];

  for (const data of otrosVendedores) {
    const usuarioVendedor =
      await prisma.usuario.findUniqueOrThrow({
        where: {
          email: data.email,
        },
        include: {
          vendedor: true,
        },
      });

    if (!usuarioVendedor.vendedor) {
      throw new Error(
        `No existe el vendedor ${data.email}.`,
      );
    }

    const tiendaVendedor = await prisma.tienda.upsert({
      where: {
        vendedorId: usuarioVendedor.vendedor.id,
      },
      update: {
        ...data.tienda,
        activa: true,
      },
      create: {
        vendedorId: usuarioVendedor.vendedor.id,
        ...data.tienda,
        activa: true,
      },
    });

    const producto = await prisma.producto.upsert({
      where: {
        codigoPublico: data.producto.codigoPublico,
      },
      update: {},
      create: {
        tiendaId: tiendaVendedor.id,
        ...data.producto,
        activo: true,
        publicado: true,
      },
    });

    await prisma.productoImagen.deleteMany({
      where: {
        productoId: producto.id,
      },
    });

    await prisma.productoImagen.create({
      data: {
        productoId: producto.id,
        ...data.imagen,
        orden: 1,
        esPrincipal: true,
      },
    });

    const variante = await prisma.productoVariante.upsert({
      where: {
        sku: data.variante.sku,
      },
      update: {
        precio: data.variante.precio,
        pesoKg: data.variante.pesoKg,
        activa: true,
      },
      create: {
        productoId: producto.id,
        sku: data.variante.sku,
        precio: data.variante.precio,
        pesoKg: data.variante.pesoKg,
        activa: true,
      },
    });

    await prisma.productoVarianteValor.deleteMany({
      where: {
        productoVarianteId: variante.id,
      },
    });

    for (const valorId of data.variante.valores) {
      await prisma.productoVarianteValor.create({
        data: {
          productoVarianteId: variante.id,
          valorAtributoId: valorId,
        },
      });
    }

    await prisma.inventario.upsert({
      where: {
        productoVarianteId: variante.id,
      },
      update: {
        stockDisponible: 20,
        stockReservado: 0,
        stockMinimo: 3,
      },
      create: {
        productoVarianteId: variante.id,
        stockDisponible: 20,
        stockReservado: 0,
        stockMinimo: 3,
      },
    });

    productosOtrosVendedores.push({
      tienda: tiendaVendedor,
      producto,
      variante,
    });
  }

  console.log('   ✓ Catálogo creado');
  console.log(`   ✓ ${variantesCreadas.length} variantes creadas`);
  console.log(
    `   ✓ ${productosOtrosVendedores.length} tiendas/productos de otros vendedores creados`,
  );

  return {

    tienda,

    productos: {
      mouseG203,
      tecladoKumara,
      hyperx,
      playeraCorreos,
      libreta,
    },

    variantes: variantesCreadas,

    otrosVendedores: productosOtrosVendedores,

  };
}