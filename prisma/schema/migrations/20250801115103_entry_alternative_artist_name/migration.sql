/*
  Warnings:

  - The `entry_artist_name` column on the `musical_entries_artists` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "musical_entries_artists" DROP COLUMN "entry_artist_name",
ADD COLUMN     "entry_artist_name" UUID;

-- AddForeignKey
ALTER TABLE "musical_entries_artists" ADD CONSTRAINT "musical_entries_artists_entry_artist_name_fkey" FOREIGN KEY ("entry_artist_name") REFERENCES "alternative_artist_names"("name_id") ON DELETE SET NULL ON UPDATE CASCADE;
