-- DropForeignKey
ALTER TABLE "envios" DROP CONSTRAINT "envios_pedidoId_fkey";

-- DropForeignKey
ALTER TABLE "envios" DROP CONSTRAINT "envios_vendedorId_fkey";

-- DropIndex
DROP INDEX "envios_pedidoId_idx";

-- DropIndex
DROP INDEX "envios_vendedorId_idx";

-- AlterTable
ALTER TABLE "envios" DROP COLUMN "pedidoId",
DROP COLUMN "vendedorId",
ADD COLUMN     "pedidoVendedorId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "transferencias_sucursal" ADD COLUMN     "vehiculoId" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "envios_pedidoVendedorId_key" ON "envios"("pedidoVendedorId");

-- CreateIndex
CREATE INDEX "transferencias_sucursal_vehiculoId_idx" ON "transferencias_sucursal"("vehiculoId");

-- AddForeignKey
ALTER TABLE "envios" ADD CONSTRAINT "envios_pedidoVendedorId_fkey" FOREIGN KEY ("pedidoVendedorId") REFERENCES "pedidos_vendedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencias_sucursal" ADD CONSTRAINT "transferencias_sucursal_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "vehiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

