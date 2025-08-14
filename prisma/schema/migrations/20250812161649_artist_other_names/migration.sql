/*
  Warnings:

  - You are about to drop the `alternative_artist_names` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "alternative_artist_names" DROP CONSTRAINT "alternative_artist_names_artist_id_fkey";

-- DropForeignKey
ALTER TABLE "musical_entries_artists" DROP CONSTRAINT "musical_entries_artists_entry_artist_name_fkey";

-- AlterTable
ALTER TABLE "artists" ADD COLUMN     "other_names" TEXT[];

-- DropTable
DROP TABLE "alternative_artist_names";
