/*
  Warnings:

  - A unique constraint covering the columns `[short_name]` on the table `musical_releases_formats` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `amount` to the `formats_of_musical_releases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `short_name` to the `musical_releases_formats` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VINYL_SPEED" AS ENUM ('SPEED_33', 'SPEED_45');

-- AlterTable
ALTER TABLE "formats_of_musical_releases" ADD COLUMN     "amount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "musical_releases_formats" ADD COLUMN     "default_speed" "VINYL_SPEED",
ADD COLUMN     "short_name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "musical_releases_formats_short_name_key" ON "musical_releases_formats"("short_name");
