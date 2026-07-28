/*
  Warnings:

  - You are about to alter the column `valor` on the `configuraciones_sistema` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "configuraciones_sistema" ALTER COLUMN "valor" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "productos" ADD COLUMN     "altoCm" DECIMAL(8,2),
ADD COLUMN     "anchoCm" DECIMAL(8,2),
ADD COLUMN     "largoCm" DECIMAL(8,2);
