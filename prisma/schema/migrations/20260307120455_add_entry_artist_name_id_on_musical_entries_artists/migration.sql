/*
  Warnings:

  - A unique constraint covering the columns `[entry_id,artist_id,entry_artist_name_id]` on the table `musical_entries_artists` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "musical_entries_artists" ADD COLUMN     "entry_artist_name_id" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "musical_entries_artists_entry_id_artist_id_entry_artist_nam_key" ON "musical_entries_artists"("entry_id", "artist_id", "entry_artist_name_id");

-- AddForeignKey
ALTER TABLE "musical_entries_artists" ADD CONSTRAINT "musical_entries_artists_entry_artist_name_id_fkey" FOREIGN KEY ("entry_artist_name_id") REFERENCES "alternative_artist_names"("name_id") ON DELETE SET NULL ON UPDATE CASCADE;
