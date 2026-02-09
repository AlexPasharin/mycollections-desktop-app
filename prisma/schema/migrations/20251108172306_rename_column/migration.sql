/*
  Warnings:

  - You are about to drop the column `hasSides` on the `musical_releases_formats` table. All the data in the column will be lost.
  - Added the required column `has_sides` to the `musical_releases_formats` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "musical_releases_formats" DROP COLUMN "hasSides",
ADD COLUMN     "has_sides" BOOLEAN NOT NULL;
