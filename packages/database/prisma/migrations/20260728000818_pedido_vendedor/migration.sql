-- CreateEnum
CREATE TYPE "EstadoPedidoVendedor" AS ENUM ('PENDIENTE_PAGO', 'PAGADO', 'PREPARANDO', 'ENVIADO', 'ENTREGADO', 'CANCELADO', 'REEMBOLSADO');

-- CreateTable
CREATE TABLE "pedidos_vendedores" (
    "id" UUID NOT NULL,
    "pedidoId" UUID NOT NULL,
    "vendedorId" UUID NOT NULL,
    "estado" "EstadoPedidoVendedor" NOT NULL DEFAULT 'PENDIENTE_PAGO',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "costoEnvioAsignado" DECIMAL(12,2) NOT NULL,
    "comisionMarketplace" DECIMAL(12,2) NOT NULL,
    "totalPedido" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_vendedores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pedidos_vendedores_pedidoId_idx" ON "pedidos_vendedores"("pedidoId");

-- CreateIndex
CREATE INDEX "pedidos_vendedores_vendedorId_idx" ON "pedidos_vendedores"("vendedorId");

-- CreateIndex
CREATE INDEX "pedidos_vendedores_estado_idx" ON "pedidos_vendedores"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_vendedores_pedidoId_vendedorId_key" ON "pedidos_vendedores"("pedidoId", "vendedorId");

-- AddForeignKey
ALTER TABLE "pedidos_vendedores" ADD CONSTRAINT "pedidos_vendedores_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_vendedores" ADD CONSTRAINT "pedidos_vendedores_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "vendedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
