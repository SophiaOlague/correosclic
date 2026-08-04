import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const PASSWORD = 'Correos123*';

interface BranchSeedData {
  codigo: string;
  nombre: string;
  estadoNombre: string;
  ciudadNombre: string;
  codigoPostal: string;
  calle: string;
  numeroExterior: string;
}

const SUCURSALES: BranchSeedData[] = [
  {
    codigo: 'SUC-DGO-01',
    nombre: 'Sucursal Durango Centro',
    estadoNombre: 'Durango',
    ciudadNombre: 'Durango',
    codigoPostal: '34000',
    calle: 'Blvd. Domingo Arrieta',
    numeroExterior: '900',
  },
  {
    codigo: 'SUC-GDL-01',
    nombre: 'Sucursal Guadalajara',
    estadoNombre: 'Jalisco',
    ciudadNombre: 'Guadalajara',
    codigoPostal: '44100',
    calle: 'Av. Vallarta',
    numeroExterior: '1500',
  },
];

/**
 * Actores y sucursales mínimos para poder probar Logistics de extremo a
 * extremo: 2 sucursales (Durango y Guadalajara -- mismas ciudades que ya usa
 * addresses.seed.ts, así que un envío entre ellas ejercita el camino con
 * transferencia y un envío dentro de Durango ejercita el camino directo).
 * Idempotente: se puede correr varias veces sin duplicar nada.
 */
export async function seedLogistics(prisma: PrismaClient) {
  console.log('🚚 Seeding logistics...');

  const pais = await prisma.pais.findUniqueOrThrow({
    where: { codigoIso2: 'MX' },
  });

  const sucursalesCreadas: Record<string, { id: string }> = {};

  for (const data of SUCURSALES) {
    const estado = await prisma.estadoProvincia.findFirstOrThrow({
      where: { nombre: data.estadoNombre },
    });

    const ciudad = await prisma.ciudad.findFirstOrThrow({
      where: { nombre: data.ciudadNombre, estadoProvinciaId: estado.id },
    });

    const codigoPostal = await prisma.codigoPostal.findFirstOrThrow({
      where: { codigo: data.codigoPostal, ciudadId: ciudad.id },
    });

    let sucursal = await prisma.sucursal.findUnique({
      where: { codigo: data.codigo },
    });

    if (!sucursal) {
      const direccion = await prisma.direccion.create({
        data: {
          paisId: pais.id,
          estadoProvinciaId: estado.id,
          ciudadId: ciudad.id,
          codigoPostalId: codigoPostal.id,
          calle: data.calle,
          numeroExterior: data.numeroExterior,
          direccionFormateada: `${data.calle} ${data.numeroExterior}, ${data.ciudadNombre}`,
          latitud: codigoPostal.latitud!,
          longitud: codigoPostal.longitud!,
        },
      });

      sucursal = await prisma.sucursal.create({
        data: {
          direccionId: direccion.id,
          codigo: data.codigo,
          nombre: data.nombre,
          activa: true,
        },
      });
    }

    sucursalesCreadas[data.codigo] = sucursal;
  }

  const sucursalDurango = sucursalesCreadas['SUC-DGO-01'];
  const sucursalGuadalajara = sucursalesCreadas['SUC-GDL-01'];

  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  await seedEmpleado(prisma, {
    email: 'recepcionista.durango@correosclic.mx',
    nombre: 'Rosa',
    apellidoPaterno: 'Domínguez',
    numeroEmpleado: 'EMP-DGO-001',
    puesto: 'Recepcionista',
    sucursalId: sucursalDurango.id,
    passwordHash,
    rolCodigo: 'RECEPCION',
  });

  await seedEmpleado(prisma, {
    email: 'recepcionista.guadalajara@correosclic.mx',
    nombre: 'Luis',
    apellidoPaterno: 'Padilla',
    numeroEmpleado: 'EMP-GDL-001',
    puesto: 'Recepcionista',
    sucursalId: sucursalGuadalajara.id,
    passwordHash,
    rolCodigo: 'RECEPCION',
  });

  const empleadoRepartidor = await seedEmpleado(prisma, {
    email: 'repartidor.durango@correosclic.mx',
    nombre: 'Jorge',
    apellidoPaterno: 'Salcido',
    numeroEmpleado: 'EMP-DGO-002',
    puesto: 'Repartidor',
    sucursalId: sucursalDurango.id,
    passwordHash,
    rolCodigo: 'REPARTIDOR',
  });

  const repartidor = await prisma.repartidor.upsert({
    where: { empleadoId: empleadoRepartidor.id },
    update: { activo: true },
    create: {
      empleadoId: empleadoRepartidor.id,
      numeroLicencia: 'LIC-DGO-0001',
      activo: true,
    },
  });

  const vehiculoDurango = await seedVehiculo(prisma, {
    placas: 'DGO-0001',
    sucursalId: sucursalDurango.id,
  });

  await seedVehiculo(prisma, {
    placas: 'GDL-0001',
    sucursalId: sucursalGuadalajara.id,
  });

  const asignacionVigente = await prisma.asignacionVehiculo.findFirst({
    where: { repartidorId: repartidor.id, fechaFin: null },
  });

  if (!asignacionVigente) {
    await prisma.asignacionVehiculo.create({
      data: {
        vehiculoId: vehiculoDurango.id,
        repartidorId: repartidor.id,
        fechaInicio: new Date(),
      },
    });
  }

  console.log(
    '   ✅ 2 sucursales, 3 empleados (2 RECEPCION, 1 REPARTIDOR), 1 repartidor, 2 vehículos',
  );
}

async function seedEmpleado(
  prisma: PrismaClient,
  data: {
    email: string;
    nombre: string;
    apellidoPaterno: string;
    numeroEmpleado: string;
    puesto: string;
    sucursalId: string;
    passwordHash: string;
    /** Código de `Rol` que habilita el panel correspondiente en el frontend. */
    rolCodigo: string;
  },
) {
  const usuario = await prisma.usuario.upsert({
    where: { email: data.email },
    update: {
      nombre: data.nombre,
      apellidoPaterno: data.apellidoPaterno,
      emailVerificado: true,
      activo: true,
    },
    create: {
      email: data.email,
      passwordHash: data.passwordHash,
      nombre: data.nombre,
      apellidoPaterno: data.apellidoPaterno,
      emailVerificado: true,
      activo: true,
    },
  });

  // Los endpoints de Logistics validan contra Empleado y Repartidor, no contra
  // roles, así que sin esto la API funcionaba pero los guards del frontend
  // dejaban al recepcionista y al repartidor fuera de su propio panel.
  const rol = await prisma.rol.findUniqueOrThrow({
    where: { codigo: data.rolCodigo },
  });

  const rolAsignado = await prisma.usuarioRol.findFirst({
    where: { usuarioId: usuario.id, rolId: rol.id },
  });

  if (!rolAsignado) {
    await prisma.usuarioRol.create({
      data: { usuarioId: usuario.id, rolId: rol.id },
    });
  }

  return prisma.empleado.upsert({
    where: { usuarioId: usuario.id },
    update: {
      sucursalId: data.sucursalId,
      puesto: data.puesto,
      activo: true,
    },
    create: {
      usuarioId: usuario.id,
      sucursalId: data.sucursalId,
      numeroEmpleado: data.numeroEmpleado,
      puesto: data.puesto,
      fechaIngreso: new Date(),
      activo: true,
    },
  });
}

async function seedVehiculo(
  prisma: PrismaClient,
  data: { placas: string; sucursalId: string },
) {
  return prisma.vehiculo.upsert({
    where: { placas: data.placas },
    update: { sucursalId: data.sucursalId, activo: true },
    create: {
      sucursalId: data.sucursalId,
      placas: data.placas,
      marca: 'Nissan',
      modelo: 'NP300',
      anio: 2022,
      capacidadKg: 500,
      activo: true,
    },
  });
}
