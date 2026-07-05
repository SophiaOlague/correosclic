import { PrismaClient } from '@prisma/client';

const INITIAL_ROLES = [
  {
    codigo: 'CLIENTE',
    nombre: 'Cliente',
    descripcion: 'Usuario que compra productos en la plataforma.',
  },
  {
    codigo: 'VENDEDOR',
    nombre: 'Vendedor',
    descripcion: 'Usuario que publica y vende productos.',
  },
  {
    codigo: 'REPARTIDOR',
    nombre: 'Repartidor',
    descripcion: 'Empleado encargado de transportar paquetes.',
  },
  {
    codigo: 'RECEPCION',
    nombre: 'Recepción',
    descripcion: 'Empleado que recibe paquetes en sucursal.',
  },
  {
    codigo: 'ADMIN_LOCAL',
    nombre: 'Administrador Local',
    descripcion: 'Administra una sucursal específica.',
  },
  {
    codigo: 'ADMIN_REGIONAL',
    nombre: 'Administrador Regional',
    descripcion: 'Administra varias sucursales de una región.',
  },
  {
    codigo: 'SUPER_ADMIN',
    nombre: 'Super Administrador',
    descripcion: 'Administrador global del sistema.',
  },
] as const;

export async function seedRoles(prisma: PrismaClient): Promise<void> {
  console.log('🌱 Seeding roles...');

 for (const role of INITIAL_ROLES
 ) {
  const data = {
    codigo: role.codigo,
    nombre: role.nombre,
    descripcion: role.descripcion,
  };

  await prisma.rol.upsert({
    where: {
      codigo: role.codigo,
    },
    update: data,
    create: data,
  });
}

  console.log(`✅ ${INITIAL_ROLES.length} roles procesados.`);
}
