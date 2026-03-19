-- AlterTable
ALTER TABLE "musical_releases" ADD COLUMN     "release_alternative_name_id" UUID;

-- AddForeignKey
ALTER TABLE "musical_releases" ADD CONSTRAINT "musical_releases_release_alternative_name_id_fkey" FOREIGN KEY ("release_alternative_name_id") REFERENCES "alternative_musical_entry_names"("name_id") ON DELETE SET NULL ON UPDATE CASCADE;
