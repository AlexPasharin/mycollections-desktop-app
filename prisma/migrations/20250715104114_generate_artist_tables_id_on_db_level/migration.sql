-- AlterTable
ALTER TABLE "alternative_artist_names" ALTER COLUMN "name_id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "artists" ALTER COLUMN "artist_id" SET DEFAULT gen_random_uuid();
