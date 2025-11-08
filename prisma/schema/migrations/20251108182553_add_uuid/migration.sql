/*
  Warnings:

  - The primary key for the `formats_of_releases` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "formats_of_releases" DROP CONSTRAINT "formats_of_releases_pkey",
ADD COLUMN     "uuid" TEXT NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "formats_of_releases_pkey" PRIMARY KEY ("uuid");
