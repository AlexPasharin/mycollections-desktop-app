/*
  Warnings:

  - You are about to drop the `musical_release_alternative_artists` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."musical_release_alternative_artists" DROP CONSTRAINT "musical_release_alternative_artists_entry_artist_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."musical_release_alternative_artists" DROP CONSTRAINT "musical_release_alternative_artists_release_id_fkey";

-- DropTable
DROP TABLE "public"."musical_release_alternative_artists";

-- CreateTable
CREATE TABLE "musical_release_special_artists" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "release_id" UUID NOT NULL,
    "artist_id" UUID NOT NULL,
    "entry_artist_name_id" UUID,

    CONSTRAINT "musical_release_special_artists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "musical_release_special_artists_release_id_artist_id_key" ON "musical_release_special_artists"("release_id", "artist_id");

-- AddForeignKey
ALTER TABLE "musical_release_special_artists" ADD CONSTRAINT "musical_release_special_artists_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "musical_releases"("release_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "musical_release_special_artists" ADD CONSTRAINT "musical_release_special_artists_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("artist_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "musical_release_special_artists" ADD CONSTRAINT "musical_release_special_artists_entry_artist_name_id_fkey" FOREIGN KEY ("entry_artist_name_id") REFERENCES "alternative_artist_names"("name_id") ON DELETE SET NULL ON UPDATE CASCADE;
