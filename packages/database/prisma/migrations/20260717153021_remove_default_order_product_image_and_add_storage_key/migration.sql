/*
  Warnings:

  - Added the required column `storageKey` to the `productos_imagenes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "productos_imagenes" ADD COLUMN     "storageKey" TEXT NOT NULL,
ALTER COLUMN "orden" DROP DEFAULT;
