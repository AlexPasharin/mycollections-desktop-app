/*
  Warnings:

  - You are about to drop the column `partOfQueenCollection` on the `musical_entries` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "musical_entries" DROP COLUMN "partOfQueenCollection",
ADD COLUMN     "part_of_queen_collection" BOOLEAN NOT NULL DEFAULT false;
