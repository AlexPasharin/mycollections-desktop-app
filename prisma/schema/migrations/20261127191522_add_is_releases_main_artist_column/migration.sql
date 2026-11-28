/*
  Warnings:

  - A unique constraint covering the columns `[release_id,artist_id,entry_artist_name_id]` on the table `musical_release_special_artists` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."musical_release_special_artists_release_id_artist_id_key";

-- AlterTable
ALTER TABLE "musical_release_special_artists" ADD COLUMN     "is_releases_main_artist" BOOLEAN DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "musical_release_special_artists_release_id_artist_id_entry__key" ON "musical_release_special_artists"("release_id", "artist_id", "entry_artist_name_id");
