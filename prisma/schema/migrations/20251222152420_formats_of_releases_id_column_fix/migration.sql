/*
  Warnings:

  - The primary key for the `formats_of_releases` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `uuid` on the `formats_of_releases` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "formats_of_releases" DROP CONSTRAINT "formats_of_releases_pkey",
DROP COLUMN "uuid",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "formats_of_releases_pkey" PRIMARY KEY ("id");
