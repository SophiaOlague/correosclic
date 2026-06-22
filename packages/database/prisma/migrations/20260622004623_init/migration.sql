-- CreateEnum
CREATE TYPE "ProveedorExterno" AS ENUM ('GOOGLE');

-- CreateEnum
CREATE TYPE "EstadoSolicitudVendedor" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('PENDIENTE_PAGO', 'PAGADO', 'PREPARANDO', 'ENVIADO', 'ENTREGADO', 'CANCELADO', 'REEMBOLSADO');

-- CreateEnum
CREATE TYPE "EstadoEnvio" AS ENUM ('PENDIENTE_RECEPCION', 'RECIBIDO_SUCURSAL', 'CLASIFICADO', 'EN_TRANSITO', 'EN_SUCURSAL_DESTINO', 'EN_REPARTO', 'ENTREGADO', 'DEVUELTO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "ResultadoIntentoEntrega" AS ENUM ('EXITOSO', 'DESTINATARIO_AUSENTE', 'DIRECCION_INCORRECTA', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'EXITOSO', 'FALLIDO', 'REEMBOLSADO');

-- CreateEnum
CREATE TYPE "EstadoReembolso" AS ENUM ('PENDIENTE', 'APROBADO', 'PROCESADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "EstadoLiquidacion" AS ENUM ('PENDIENTE', 'PAGADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('PEDIDO', 'ENVIO', 'REEMBOLSO', 'SISTEMA');

-- CreateEnum
CREATE TYPE "PlataformaPush" AS ENUM ('ANDROID', 'IOS', 'WEB');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" TEXT,
    "nombre" VARCHAR(100) NOT NULL,
    "apellidoPaterno" VARCHAR(100) NOT NULL,
    "apellidoMaterno" VARCHAR(100),
    "telefono" VARCHAR(20),
    "emailVerificado" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "codigo" VARCHAR(100) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permisos" (
    "id" UUID NOT NULL,
    "codigo" VARCHAR(150) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_roles" (
    "usuarioId" UUID NOT NULL,
    "rolId" UUID NOT NULL,
    "asignadoAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_roles_pkey" PRIMARY KEY ("usuarioId","rolId")
);

-- CreateTable
CREATE TABLE "roles_permisos" (
    "rolId" UUID NOT NULL,
    "permisoId" UUID NOT NULL,

    CONSTRAINT "roles_permisos_pkey" PRIMARY KEY ("rolId","permisoId")
);

-- CreateTable
CREATE TABLE "sesiones" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiraAt" TIMESTAMP(3) NOT NULL,
    "revocadaAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sesiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuentas_externas" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "proveedor" "ProveedorExterno" NOT NULL,
    "proveedorUsuarioId" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "nombreMostrar" VARCHAR(255),
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cuentas_externas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paises" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "codigoIso2" CHAR(2) NOT NULL,
    "codigoIso3" CHAR(3) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "paises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regiones" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estados_provincias" (
    "id" UUID NOT NULL,
    "paisId" UUID NOT NULL,
    "regionId" UUID,
    "nombre" VARCHAR(100) NOT NULL,
    "codigo" VARCHAR(20),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estados_provincias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ciudades" (
    "id" UUID NOT NULL,
    "estadoProvinciaId" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ciudades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "codigos_postales" (
    "id" UUID NOT NULL,
    "ciudadId" UUID NOT NULL,
    "codigo" VARCHAR(10) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "codigos_postales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direcciones" (
    "id" UUID NOT NULL,
    "paisId" UUID NOT NULL,
    "estadoProvinciaId" UUID NOT NULL,
    "ciudadId" UUID NOT NULL,
    "codigoPostalId" UUID NOT NULL,
    "alias" VARCHAR(100),
    "calle" VARCHAR(255) NOT NULL,
    "numeroExterior" VARCHAR(30) NOT NULL,
    "numeroInterior" VARCHAR(30),
    "colonia" VARCHAR(150),
    "referencias" TEXT,
    "direccionFormateada" TEXT,
    "latitud" DECIMAL(11,8) NOT NULL,
    "longitud" DECIMAL(12,8) NOT NULL,
    "googlePlaceId" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "direcciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sucursales" (
    "id" UUID NOT NULL,
    "direccionId" UUID NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "telefono" VARCHAR(20),
    "email" VARCHAR(255),
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sucursales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empleados" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "sucursalId" UUID NOT NULL,
    "numeroEmpleado" VARCHAR(50) NOT NULL,
    "puesto" VARCHAR(100) NOT NULL,
    "fechaIngreso" TIMESTAMP(3) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empleados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repartidores" (
    "id" UUID NOT NULL,
    "empleadoId" UUID NOT NULL,
    "numeroLicencia" VARCHAR(100) NOT NULL,
    "fechaVencimientoLicencia" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repartidores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehiculos" (
    "id" UUID NOT NULL,
    "sucursalId" UUID NOT NULL,
    "placas" VARCHAR(20) NOT NULL,
    "marca" VARCHAR(100) NOT NULL,
    "modelo" VARCHAR(100) NOT NULL,
    "anio" INTEGER NOT NULL,
    "capacidadKg" DECIMAL(10,2) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehiculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignaciones_vehiculo" (
    "id" UUID NOT NULL,
    "vehiculoId" UUID NOT NULL,
    "repartidorId" UUID NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asignaciones_vehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direcciones_cliente" (
    "id" UUID NOT NULL,
    "clienteId" UUID NOT NULL,
    "direccionId" UUID NOT NULL,
    "esPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "direcciones_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes_vendedor" (
    "id" UUID NOT NULL,
    "clienteId" UUID NOT NULL,
    "estado" "EstadoSolicitudVendedor" NOT NULL DEFAULT 'PENDIENTE',
    "comentariosRevision" TEXT,
    "fechaRevision" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitudes_vendedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_vendedor" (
    "id" UUID NOT NULL,
    "solicitudVendedorId" UUID NOT NULL,
    "tipoDocumento" VARCHAR(50) NOT NULL,
    "nombreArchivo" VARCHAR(255) NOT NULL,
    "urlArchivo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documentos_vendedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "informacion_fiscal" (
    "id" UUID NOT NULL,
    "solicitudVendedorId" UUID NOT NULL,
    "rfc" VARCHAR(20) NOT NULL,
    "razonSocial" VARCHAR(255) NOT NULL,
    "regimenFiscal" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "informacion_fiscal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendedores" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "solicitudAprobadaId" UUID NOT NULL,
    "fechaAprobacion" TIMESTAMP(3) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tiendas" (
    "id" UUID NOT NULL,
    "vendedorId" UUID NOT NULL,
    "codigoPublico" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,
    "logoUrl" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tiendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" UUID NOT NULL,
    "parentId" UUID,
    "nombre" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" UUID NOT NULL,
    "tiendaId" UUID NOT NULL,
    "categoriaId" UUID NOT NULL,
    "codigoPublico" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,
    "pesoKg" DECIMAL(10,3) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos_imagenes" (
    "id" UUID NOT NULL,
    "productoId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 1,
    "esPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "productos_imagenes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atributos" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "atributos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "valores_atributo" (
    "id" UUID NOT NULL,
    "atributoId" UUID NOT NULL,
    "valor" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "valores_atributo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos_variantes" (
    "id" UUID NOT NULL,
    "productoId" UUID NOT NULL,
    "sku" VARCHAR(100) NOT NULL,
    "precio" DECIMAL(12,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "pesoKg" DECIMAL(10,3),
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_variantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos_variantes_valores" (
    "productoVarianteId" UUID NOT NULL,
    "valorAtributoId" UUID NOT NULL,

    CONSTRAINT "productos_variantes_valores_pkey" PRIMARY KEY ("productoVarianteId","valorAtributoId")
);

-- CreateTable
CREATE TABLE "carritos" (
    "id" UUID NOT NULL,
    "clienteId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carritos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carritos_items" (
    "id" UUID NOT NULL,
    "carritoId" UUID NOT NULL,
    "productoVarianteId" UUID NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carritos_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" UUID NOT NULL,
    "clienteId" UUID NOT NULL,
    "direccionEntregaId" UUID NOT NULL,
    "codigoPedido" VARCHAR(50) NOT NULL,
    "estado" "EstadoPedido" NOT NULL DEFAULT 'PENDIENTE_PAGO',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "costoEnvio" DECIMAL(12,2) NOT NULL,
    "comisionCorreosClic" DECIMAL(12,2) NOT NULL,
    "totalVendedores" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "fechaPago" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos_items" (
    "id" UUID NOT NULL,
    "pedidoId" UUID NOT NULL,
    "productoVarianteId" UUID NOT NULL,
    "vendedorId" UUID NOT NULL,
    "nombreTienda" VARCHAR(255) NOT NULL,
    "nombreProducto" VARCHAR(255) NOT NULL,
    "sku" VARCHAR(100) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedidos_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "envios" (
    "id" UUID NOT NULL,
    "pedidoId" UUID NOT NULL,
    "vendedorId" UUID NOT NULL,
    "sucursalOrigenId" UUID NOT NULL,
    "sucursalDestinoId" UUID NOT NULL,
    "trackingInterno" VARCHAR(50) NOT NULL,
    "trackingOficial" VARCHAR(100),
    "estado" "EstadoEnvio" NOT NULL DEFAULT 'PENDIENTE_RECEPCION',
    "fechaEntregaEstimada" TIMESTAMP(3),
    "fechaEntregaReal" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "envios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "envios_items" (
    "id" UUID NOT NULL,
    "envioId" UUID NOT NULL,
    "pedidoItemId" UUID NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "envios_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_tracking" (
    "id" UUID NOT NULL,
    "envioId" UUID NOT NULL,
    "sucursalId" UUID,
    "estado" "EstadoEnvio" NOT NULL,
    "descripcion" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recepciones_sucursal" (
    "id" UUID NOT NULL,
    "envioId" UUID NOT NULL,
    "sucursalId" UUID NOT NULL,
    "empleadoId" UUID NOT NULL,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recepciones_sucursal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transferencias_sucursal" (
    "id" UUID NOT NULL,
    "envioId" UUID NOT NULL,
    "sucursalOrigenId" UUID NOT NULL,
    "sucursalDestinoId" UUID NOT NULL,
    "fechaSalida" TIMESTAMP(3) NOT NULL,
    "fechaLlegada" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transferencias_sucursal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entregas" (
    "id" UUID NOT NULL,
    "envioId" UUID NOT NULL,
    "repartidorId" UUID NOT NULL,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL,
    "fechaEntrega" TIMESTAMP(3),
    "nombreRecibe" VARCHAR(255),
    "fotoEntregaUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entregas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intentos_entrega" (
    "id" UUID NOT NULL,
    "entregaId" UUID NOT NULL,
    "numeroIntento" INTEGER NOT NULL,
    "resultado" "ResultadoIntentoEntrega" NOT NULL,
    "observaciones" TEXT,
    "fotoIntentoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intentos_entrega_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" UUID NOT NULL,
    "pedidoId" UUID NOT NULL,
    "stripePaymentIntentId" VARCHAR(255),
    "stripeChargeId" VARCHAR(255),
    "estado" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "monto" DECIMAL(12,2) NOT NULL,
    "moneda" CHAR(3) NOT NULL DEFAULT 'MXN',
    "mensajeError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reembolsos" (
    "id" UUID NOT NULL,
    "pedidoId" UUID NOT NULL,
    "estado" "EstadoReembolso" NOT NULL DEFAULT 'PENDIENTE',
    "monto" DECIMAL(12,2) NOT NULL,
    "motivo" TEXT,
    "fechaProcesado" TIMESTAMP(3),
    "stripeRefundId" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reembolsos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "liquidaciones_vendedores" (
    "id" UUID NOT NULL,
    "vendedorId" UUID NOT NULL,
    "estado" "EstadoLiquidacion" NOT NULL DEFAULT 'PENDIENTE',
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "montoBruto" DECIMAL(12,2) NOT NULL,
    "comisionCorreosClic" DECIMAL(12,2) NOT NULL,
    "montoNeto" DECIMAL(12,2) NOT NULL,
    "fechaPago" TIMESTAMP(3),
    "referenciaPago" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "liquidaciones_vendedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "liquidaciones_vendedores_detalle" (
    "id" UUID NOT NULL,
    "liquidacionVendedorId" UUID NOT NULL,
    "pedidoItemId" UUID NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "liquidaciones_vendedores_detalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispositivos_push" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "plataforma" "PlataformaPush" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dispositivos_push_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantillas_notificaciones" (
    "id" UUID NOT NULL,
    "codigo" VARCHAR(100) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "mensaje" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plantillas_notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "plantillaId" UUID,
    "tipo" "TipoNotificacion" NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "fechaLectura" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuraciones_sistema" (
    "id" UUID NOT NULL,
    "clave" VARCHAR(100) NOT NULL,
    "valor" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuraciones_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria" (
    "id" UUID NOT NULL,
    "usuarioId" UUID,
    "accion" VARCHAR(100) NOT NULL,
    "entidad" VARCHAR(100) NOT NULL,
    "entidadId" UUID,
    "detalles" TEXT,
    "ipAddress" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_activo_idx" ON "usuarios"("activo");

-- CreateIndex
CREATE INDEX "usuarios_emailVerificado_idx" ON "usuarios"("emailVerificado");

-- CreateIndex
CREATE UNIQUE INDEX "roles_codigo_key" ON "roles"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "permisos_codigo_key" ON "permisos"("codigo");

-- CreateIndex
CREATE INDEX "sesiones_usuarioId_idx" ON "sesiones"("usuarioId");

-- CreateIndex
CREATE INDEX "sesiones_expiraAt_idx" ON "sesiones"("expiraAt");

-- CreateIndex
CREATE INDEX "cuentas_externas_usuarioId_idx" ON "cuentas_externas"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "cuentas_externas_proveedor_proveedorUsuarioId_key" ON "cuentas_externas"("proveedor", "proveedorUsuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "paises_nombre_key" ON "paises"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "paises_codigoIso2_key" ON "paises"("codigoIso2");

-- CreateIndex
CREATE UNIQUE INDEX "paises_codigoIso3_key" ON "paises"("codigoIso3");

-- CreateIndex
CREATE INDEX "paises_activo_idx" ON "paises"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "regiones_nombre_key" ON "regiones"("nombre");

-- CreateIndex
CREATE INDEX "regiones_activo_idx" ON "regiones"("activo");

-- CreateIndex
CREATE INDEX "estados_provincias_paisId_idx" ON "estados_provincias"("paisId");

-- CreateIndex
CREATE INDEX "estados_provincias_regionId_idx" ON "estados_provincias"("regionId");

-- CreateIndex
CREATE INDEX "estados_provincias_activo_idx" ON "estados_provincias"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "estados_provincias_paisId_nombre_key" ON "estados_provincias"("paisId", "nombre");

-- CreateIndex
CREATE INDEX "ciudades_estadoProvinciaId_idx" ON "ciudades"("estadoProvinciaId");

-- CreateIndex
CREATE INDEX "ciudades_activo_idx" ON "ciudades"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "ciudades_estadoProvinciaId_nombre_key" ON "ciudades"("estadoProvinciaId", "nombre");

-- CreateIndex
CREATE INDEX "codigos_postales_ciudadId_idx" ON "codigos_postales"("ciudadId");

-- CreateIndex
CREATE INDEX "codigos_postales_activo_idx" ON "codigos_postales"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "codigos_postales_ciudadId_codigo_key" ON "codigos_postales"("ciudadId", "codigo");

-- CreateIndex
CREATE INDEX "direcciones_paisId_idx" ON "direcciones"("paisId");

-- CreateIndex
CREATE INDEX "direcciones_estadoProvinciaId_idx" ON "direcciones"("estadoProvinciaId");

-- CreateIndex
CREATE INDEX "direcciones_ciudadId_idx" ON "direcciones"("ciudadId");

-- CreateIndex
CREATE INDEX "direcciones_codigoPostalId_idx" ON "direcciones"("codigoPostalId");

-- CreateIndex
CREATE INDEX "direcciones_googlePlaceId_idx" ON "direcciones"("googlePlaceId");

-- CreateIndex
CREATE UNIQUE INDEX "sucursales_direccionId_key" ON "sucursales"("direccionId");

-- CreateIndex
CREATE UNIQUE INDEX "sucursales_codigo_key" ON "sucursales"("codigo");

-- CreateIndex
CREATE INDEX "sucursales_activa_idx" ON "sucursales"("activa");

-- CreateIndex
CREATE UNIQUE INDEX "empleados_usuarioId_key" ON "empleados"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "empleados_numeroEmpleado_key" ON "empleados"("numeroEmpleado");

-- CreateIndex
CREATE INDEX "empleados_sucursalId_idx" ON "empleados"("sucursalId");

-- CreateIndex
CREATE INDEX "empleados_activo_idx" ON "empleados"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "repartidores_empleadoId_key" ON "repartidores"("empleadoId");

-- CreateIndex
CREATE UNIQUE INDEX "repartidores_numeroLicencia_key" ON "repartidores"("numeroLicencia");

-- CreateIndex
CREATE INDEX "repartidores_activo_idx" ON "repartidores"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "vehiculos_placas_key" ON "vehiculos"("placas");

-- CreateIndex
CREATE INDEX "vehiculos_sucursalId_idx" ON "vehiculos"("sucursalId");

-- CreateIndex
CREATE INDEX "vehiculos_activo_idx" ON "vehiculos"("activo");

-- CreateIndex
CREATE INDEX "asignaciones_vehiculo_vehiculoId_idx" ON "asignaciones_vehiculo"("vehiculoId");

-- CreateIndex
CREATE INDEX "asignaciones_vehiculo_repartidorId_idx" ON "asignaciones_vehiculo"("repartidorId");

-- CreateIndex
CREATE INDEX "asignaciones_vehiculo_fechaInicio_idx" ON "asignaciones_vehiculo"("fechaInicio");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_usuarioId_key" ON "clientes"("usuarioId");

-- CreateIndex
CREATE INDEX "clientes_activo_idx" ON "clientes"("activo");

-- CreateIndex
CREATE INDEX "direcciones_cliente_clienteId_idx" ON "direcciones_cliente"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "direcciones_cliente_clienteId_direccionId_key" ON "direcciones_cliente"("clienteId", "direccionId");

-- CreateIndex
CREATE INDEX "solicitudes_vendedor_clienteId_idx" ON "solicitudes_vendedor"("clienteId");

-- CreateIndex
CREATE INDEX "solicitudes_vendedor_estado_idx" ON "solicitudes_vendedor"("estado");

-- CreateIndex
CREATE INDEX "documentos_vendedor_solicitudVendedorId_idx" ON "documentos_vendedor"("solicitudVendedorId");

-- CreateIndex
CREATE UNIQUE INDEX "informacion_fiscal_solicitudVendedorId_key" ON "informacion_fiscal"("solicitudVendedorId");

-- CreateIndex
CREATE INDEX "informacion_fiscal_rfc_idx" ON "informacion_fiscal"("rfc");

-- CreateIndex
CREATE UNIQUE INDEX "vendedores_usuarioId_key" ON "vendedores"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "vendedores_solicitudAprobadaId_key" ON "vendedores"("solicitudAprobadaId");

-- CreateIndex
CREATE INDEX "vendedores_activo_idx" ON "vendedores"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "tiendas_vendedorId_key" ON "tiendas"("vendedorId");

-- CreateIndex
CREATE UNIQUE INDEX "tiendas_codigoPublico_key" ON "tiendas"("codigoPublico");

-- CreateIndex
CREATE INDEX "tiendas_activa_idx" ON "tiendas"("activa");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_slug_key" ON "categorias"("slug");

-- CreateIndex
CREATE INDEX "categorias_parentId_idx" ON "categorias"("parentId");

-- CreateIndex
CREATE INDEX "categorias_activa_idx" ON "categorias"("activa");

-- CreateIndex
CREATE UNIQUE INDEX "productos_codigoPublico_key" ON "productos"("codigoPublico");

-- CreateIndex
CREATE INDEX "productos_tiendaId_idx" ON "productos"("tiendaId");

-- CreateIndex
CREATE INDEX "productos_categoriaId_idx" ON "productos"("categoriaId");

-- CreateIndex
CREATE INDEX "productos_activo_idx" ON "productos"("activo");

-- CreateIndex
CREATE INDEX "productos_imagenes_productoId_idx" ON "productos_imagenes"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "atributos_nombre_key" ON "atributos"("nombre");

-- CreateIndex
CREATE INDEX "valores_atributo_atributoId_idx" ON "valores_atributo"("atributoId");

-- CreateIndex
CREATE UNIQUE INDEX "valores_atributo_atributoId_valor_key" ON "valores_atributo"("atributoId", "valor");

-- CreateIndex
CREATE UNIQUE INDEX "productos_variantes_sku_key" ON "productos_variantes"("sku");

-- CreateIndex
CREATE INDEX "productos_variantes_productoId_idx" ON "productos_variantes"("productoId");

-- CreateIndex
CREATE INDEX "productos_variantes_activa_idx" ON "productos_variantes"("activa");

-- CreateIndex
CREATE UNIQUE INDEX "carritos_clienteId_key" ON "carritos"("clienteId");

-- CreateIndex
CREATE INDEX "carritos_items_carritoId_idx" ON "carritos_items"("carritoId");

-- CreateIndex
CREATE UNIQUE INDEX "carritos_items_carritoId_productoVarianteId_key" ON "carritos_items"("carritoId", "productoVarianteId");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_codigoPedido_key" ON "pedidos"("codigoPedido");

-- CreateIndex
CREATE INDEX "pedidos_clienteId_idx" ON "pedidos"("clienteId");

-- CreateIndex
CREATE INDEX "pedidos_estado_idx" ON "pedidos"("estado");

-- CreateIndex
CREATE INDEX "pedidos_fechaPago_idx" ON "pedidos"("fechaPago");

-- CreateIndex
CREATE INDEX "pedidos_items_pedidoId_idx" ON "pedidos_items"("pedidoId");

-- CreateIndex
CREATE INDEX "pedidos_items_productoVarianteId_idx" ON "pedidos_items"("productoVarianteId");

-- CreateIndex
CREATE INDEX "pedidos_items_vendedorId_idx" ON "pedidos_items"("vendedorId");

-- CreateIndex
CREATE UNIQUE INDEX "envios_trackingInterno_key" ON "envios"("trackingInterno");

-- CreateIndex
CREATE INDEX "envios_pedidoId_idx" ON "envios"("pedidoId");

-- CreateIndex
CREATE INDEX "envios_vendedorId_idx" ON "envios"("vendedorId");

-- CreateIndex
CREATE INDEX "envios_estado_idx" ON "envios"("estado");

-- CreateIndex
CREATE INDEX "envios_trackingInterno_idx" ON "envios"("trackingInterno");

-- CreateIndex
CREATE INDEX "envios_items_envioId_idx" ON "envios_items"("envioId");

-- CreateIndex
CREATE INDEX "envios_items_pedidoItemId_idx" ON "envios_items"("pedidoItemId");

-- CreateIndex
CREATE UNIQUE INDEX "envios_items_envioId_pedidoItemId_key" ON "envios_items"("envioId", "pedidoItemId");

-- CreateIndex
CREATE INDEX "eventos_tracking_envioId_idx" ON "eventos_tracking"("envioId");

-- CreateIndex
CREATE INDEX "eventos_tracking_sucursalId_idx" ON "eventos_tracking"("sucursalId");

-- CreateIndex
CREATE INDEX "eventos_tracking_estado_idx" ON "eventos_tracking"("estado");

-- CreateIndex
CREATE INDEX "eventos_tracking_createdAt_idx" ON "eventos_tracking"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "recepciones_sucursal_envioId_key" ON "recepciones_sucursal"("envioId");

-- CreateIndex
CREATE INDEX "recepciones_sucursal_sucursalId_idx" ON "recepciones_sucursal"("sucursalId");

-- CreateIndex
CREATE INDEX "transferencias_sucursal_envioId_idx" ON "transferencias_sucursal"("envioId");

-- CreateIndex
CREATE UNIQUE INDEX "entregas_envioId_key" ON "entregas"("envioId");

-- CreateIndex
CREATE INDEX "entregas_repartidorId_idx" ON "entregas"("repartidorId");

-- CreateIndex
CREATE INDEX "intentos_entrega_entregaId_idx" ON "intentos_entrega"("entregaId");

-- CreateIndex
CREATE UNIQUE INDEX "intentos_entrega_entregaId_numeroIntento_key" ON "intentos_entrega"("entregaId", "numeroIntento");

-- CreateIndex
CREATE UNIQUE INDEX "pagos_stripePaymentIntentId_key" ON "pagos"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "pagos_stripeChargeId_key" ON "pagos"("stripeChargeId");

-- CreateIndex
CREATE INDEX "pagos_pedidoId_idx" ON "pagos"("pedidoId");

-- CreateIndex
CREATE INDEX "pagos_estado_idx" ON "pagos"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "reembolsos_stripeRefundId_key" ON "reembolsos"("stripeRefundId");

-- CreateIndex
CREATE INDEX "reembolsos_pedidoId_idx" ON "reembolsos"("pedidoId");

-- CreateIndex
CREATE INDEX "reembolsos_estado_idx" ON "reembolsos"("estado");

-- CreateIndex
CREATE INDEX "liquidaciones_vendedores_vendedorId_idx" ON "liquidaciones_vendedores"("vendedorId");

-- CreateIndex
CREATE INDEX "liquidaciones_vendedores_estado_idx" ON "liquidaciones_vendedores"("estado");

-- CreateIndex
CREATE INDEX "liquidaciones_vendedores_detalle_liquidacionVendedorId_idx" ON "liquidaciones_vendedores_detalle"("liquidacionVendedorId");

-- CreateIndex
CREATE INDEX "liquidaciones_vendedores_detalle_pedidoItemId_idx" ON "liquidaciones_vendedores_detalle"("pedidoItemId");

-- CreateIndex
CREATE UNIQUE INDEX "liquidaciones_vendedores_detalle_liquidacionVendedorId_pedi_key" ON "liquidaciones_vendedores_detalle"("liquidacionVendedorId", "pedidoItemId");

-- CreateIndex
CREATE UNIQUE INDEX "dispositivos_push_token_key" ON "dispositivos_push"("token");

-- CreateIndex
CREATE INDEX "dispositivos_push_usuarioId_idx" ON "dispositivos_push"("usuarioId");

-- CreateIndex
CREATE INDEX "dispositivos_push_activo_idx" ON "dispositivos_push"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "plantillas_notificaciones_codigo_key" ON "plantillas_notificaciones"("codigo");

-- CreateIndex
CREATE INDEX "plantillas_notificaciones_activa_idx" ON "plantillas_notificaciones"("activa");

-- CreateIndex
CREATE INDEX "notificaciones_usuarioId_idx" ON "notificaciones"("usuarioId");

-- CreateIndex
CREATE INDEX "notificaciones_plantillaId_idx" ON "notificaciones"("plantillaId");

-- CreateIndex
CREATE INDEX "notificaciones_tipo_idx" ON "notificaciones"("tipo");

-- CreateIndex
CREATE INDEX "notificaciones_leida_idx" ON "notificaciones"("leida");

-- CreateIndex
CREATE UNIQUE INDEX "configuraciones_sistema_clave_key" ON "configuraciones_sistema"("clave");

-- CreateIndex
CREATE INDEX "auditoria_usuarioId_idx" ON "auditoria"("usuarioId");

-- CreateIndex
CREATE INDEX "auditoria_accion_idx" ON "auditoria"("accion");

-- CreateIndex
CREATE INDEX "auditoria_entidad_idx" ON "auditoria"("entidad");

-- CreateIndex
CREATE INDEX "auditoria_createdAt_idx" ON "auditoria"("createdAt");

-- AddForeignKey
ALTER TABLE "usuarios_roles" ADD CONSTRAINT "usuarios_roles_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_roles" ADD CONSTRAINT "usuarios_roles_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_permisos" ADD CONSTRAINT "roles_permisos_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_permisos" ADD CONSTRAINT "roles_permisos_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "permisos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas_externas" ADD CONSTRAINT "cuentas_externas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estados_provincias" ADD CONSTRAINT "estados_provincias_paisId_fkey" FOREIGN KEY ("paisId") REFERENCES "paises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estados_provincias" ADD CONSTRAINT "estados_provincias_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regiones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ciudades" ADD CONSTRAINT "ciudades_estadoProvinciaId_fkey" FOREIGN KEY ("estadoProvinciaId") REFERENCES "estados_provincias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "codigos_postales" ADD CONSTRAINT "codigos_postales_ciudadId_fkey" FOREIGN KEY ("ciudadId") REFERENCES "ciudades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direcciones" ADD CONSTRAINT "direcciones_paisId_fkey" FOREIGN KEY ("paisId") REFERENCES "paises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direcciones" ADD CONSTRAINT "direcciones_estadoProvinciaId_fkey" FOREIGN KEY ("estadoProvinciaId") REFERENCES "estados_provincias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direcciones" ADD CONSTRAINT "direcciones_ciudadId_fkey" FOREIGN KEY ("ciudadId") REFERENCES "ciudades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direcciones" ADD CONSTRAINT "direcciones_codigoPostalId_fkey" FOREIGN KEY ("codigoPostalId") REFERENCES "codigos_postales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sucursales" ADD CONSTRAINT "sucursales_direccionId_fkey" FOREIGN KEY ("direccionId") REFERENCES "direcciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empleados" ADD CONSTRAINT "empleados_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empleados" ADD CONSTRAINT "empleados_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "sucursales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repartidores" ADD CONSTRAINT "repartidores_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "empleados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehiculos" ADD CONSTRAINT "vehiculos_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "sucursales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_vehiculo" ADD CONSTRAINT "asignaciones_vehiculo_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "vehiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_vehiculo" ADD CONSTRAINT "asignaciones_vehiculo_repartidorId_fkey" FOREIGN KEY ("repartidorId") REFERENCES "repartidores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direcciones_cliente" ADD CONSTRAINT "direcciones_cliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direcciones_cliente" ADD CONSTRAINT "direcciones_cliente_direccionId_fkey" FOREIGN KEY ("direccionId") REFERENCES "direcciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_vendedor" ADD CONSTRAINT "solicitudes_vendedor_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_vendedor" ADD CONSTRAINT "documentos_vendedor_solicitudVendedorId_fkey" FOREIGN KEY ("solicitudVendedorId") REFERENCES "solicitudes_vendedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "informacion_fiscal" ADD CONSTRAINT "informacion_fiscal_solicitudVendedorId_fkey" FOREIGN KEY ("solicitudVendedorId") REFERENCES "solicitudes_vendedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendedores" ADD CONSTRAINT "vendedores_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendedores" ADD CONSTRAINT "vendedores_solicitudAprobadaId_fkey" FOREIGN KEY ("solicitudAprobadaId") REFERENCES "solicitudes_vendedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tiendas" ADD CONSTRAINT "tiendas_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "vendedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_tiendaId_fkey" FOREIGN KEY ("tiendaId") REFERENCES "tiendas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos_imagenes" ADD CONSTRAINT "productos_imagenes_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valores_atributo" ADD CONSTRAINT "valores_atributo_atributoId_fkey" FOREIGN KEY ("atributoId") REFERENCES "atributos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos_variantes" ADD CONSTRAINT "productos_variantes_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos_variantes_valores" ADD CONSTRAINT "productos_variantes_valores_productoVarianteId_fkey" FOREIGN KEY ("productoVarianteId") REFERENCES "productos_variantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos_variantes_valores" ADD CONSTRAINT "productos_variantes_valores_valorAtributoId_fkey" FOREIGN KEY ("valorAtributoId") REFERENCES "valores_atributo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carritos" ADD CONSTRAINT "carritos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carritos_items" ADD CONSTRAINT "carritos_items_carritoId_fkey" FOREIGN KEY ("carritoId") REFERENCES "carritos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carritos_items" ADD CONSTRAINT "carritos_items_productoVarianteId_fkey" FOREIGN KEY ("productoVarianteId") REFERENCES "productos_variantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_direccionEntregaId_fkey" FOREIGN KEY ("direccionEntregaId") REFERENCES "direcciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_items" ADD CONSTRAINT "pedidos_items_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_items" ADD CONSTRAINT "pedidos_items_productoVarianteId_fkey" FOREIGN KEY ("productoVarianteId") REFERENCES "productos_variantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_items" ADD CONSTRAINT "pedidos_items_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "vendedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envios" ADD CONSTRAINT "envios_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envios" ADD CONSTRAINT "envios_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "vendedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envios" ADD CONSTRAINT "envios_sucursalOrigenId_fkey" FOREIGN KEY ("sucursalOrigenId") REFERENCES "sucursales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envios" ADD CONSTRAINT "envios_sucursalDestinoId_fkey" FOREIGN KEY ("sucursalDestinoId") REFERENCES "sucursales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envios_items" ADD CONSTRAINT "envios_items_envioId_fkey" FOREIGN KEY ("envioId") REFERENCES "envios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envios_items" ADD CONSTRAINT "envios_items_pedidoItemId_fkey" FOREIGN KEY ("pedidoItemId") REFERENCES "pedidos_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_tracking" ADD CONSTRAINT "eventos_tracking_envioId_fkey" FOREIGN KEY ("envioId") REFERENCES "envios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_tracking" ADD CONSTRAINT "eventos_tracking_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "sucursales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recepciones_sucursal" ADD CONSTRAINT "recepciones_sucursal_envioId_fkey" FOREIGN KEY ("envioId") REFERENCES "envios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recepciones_sucursal" ADD CONSTRAINT "recepciones_sucursal_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "sucursales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recepciones_sucursal" ADD CONSTRAINT "recepciones_sucursal_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "empleados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencias_sucursal" ADD CONSTRAINT "transferencias_sucursal_envioId_fkey" FOREIGN KEY ("envioId") REFERENCES "envios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencias_sucursal" ADD CONSTRAINT "transferencias_sucursal_sucursalOrigenId_fkey" FOREIGN KEY ("sucursalOrigenId") REFERENCES "sucursales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencias_sucursal" ADD CONSTRAINT "transferencias_sucursal_sucursalDestinoId_fkey" FOREIGN KEY ("sucursalDestinoId") REFERENCES "sucursales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas" ADD CONSTRAINT "entregas_envioId_fkey" FOREIGN KEY ("envioId") REFERENCES "envios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas" ADD CONSTRAINT "entregas_repartidorId_fkey" FOREIGN KEY ("repartidorId") REFERENCES "repartidores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intentos_entrega" ADD CONSTRAINT "intentos_entrega_entregaId_fkey" FOREIGN KEY ("entregaId") REFERENCES "entregas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reembolsos" ADD CONSTRAINT "reembolsos_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liquidaciones_vendedores" ADD CONSTRAINT "liquidaciones_vendedores_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "vendedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liquidaciones_vendedores_detalle" ADD CONSTRAINT "liquidaciones_vendedores_detalle_liquidacionVendedorId_fkey" FOREIGN KEY ("liquidacionVendedorId") REFERENCES "liquidaciones_vendedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liquidaciones_vendedores_detalle" ADD CONSTRAINT "liquidaciones_vendedores_detalle_pedidoItemId_fkey" FOREIGN KEY ("pedidoItemId") REFERENCES "pedidos_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispositivos_push" ADD CONSTRAINT "dispositivos_push_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_plantillaId_fkey" FOREIGN KEY ("plantillaId") REFERENCES "plantillas_notificaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
