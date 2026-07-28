-- AlterTable
ALTER TABLE "estados_provincias" ADD COLUMN     "latitudReferencia" DECIMAL(11,8),
ADD COLUMN     "longitudReferencia" DECIMAL(12,8);

-- AlterTable
ALTER TABLE "vendedores" ADD COLUMN     "estadoOperacionId" UUID;

-- CreateIndex
CREATE INDEX "vendedores_estadoOperacionId_idx" ON "vendedores"("estadoOperacionId");

-- AddForeignKey
ALTER TABLE "vendedores" ADD CONSTRAINT "vendedores_estadoOperacionId_fkey" FOREIGN KEY ("estadoOperacionId") REFERENCES "estados_provincias"("id") ON DELETE SET NULL ON UPDATE CASCADE;
