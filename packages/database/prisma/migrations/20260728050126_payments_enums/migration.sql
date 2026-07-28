-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('CARD', 'SPEI', 'OXXO', 'APPLE_PAY', 'GOOGLE_PAY', 'OTRO');

-- AlterEnum
-- Postgres exige que los valores nuevos de un enum estén comprometidos
-- (en su propia transacción) antes de poder usarse -- por eso esta migración
-- SOLO agrega los valores del enum, y la migración siguiente (que sí los usa
-- en el índice parcial) queda separada.
ALTER TYPE "EstadoPago" ADD VALUE 'REQUIERE_ACCION';
ALTER TYPE "EstadoPago" ADD VALUE 'PROCESANDO';
ALTER TYPE "EstadoPago" ADD VALUE 'CANCELADO';

-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "stripeCustomerId" VARCHAR(255);

-- AlterTable
ALTER TABLE "pagos" ADD COLUMN     "metodoPago" "MetodoPago",
ADD COLUMN     "stripeIdempotencyKey" VARCHAR(255),
ADD COLUMN     "ultimoEventoStripeEn" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_stripeCustomerId_key" ON "clientes"("stripeCustomerId");
