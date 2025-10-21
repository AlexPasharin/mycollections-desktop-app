/*
  Warnings:

  - You are about to drop the `musical_release_alternative_artist` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."musical_release_alternative_artist" DROP CONSTRAINT "musical_release_alternative_artist_artist_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."musical_release_alternative_artist" DROP CONSTRAINT "musical_release_alternative_artist_release_id_fkey";

-- DropTable
DROP TABLE "public"."musical_release_alternative_artist";

-- CreateTable
CREATE TABLE "musical_release_alternative_artists" (
    "release_id" UUID NOT NULL,
    "artist_id" UUID NOT NULL,
    "alternative_artist_name" TEXT,

    CONSTRAINT "musical_release_alternative_artists_pkey" PRIMARY KEY ("release_id","artist_id")
);

-- AddForeignKey
ALTER TABLE "musical_release_alternative_artists" ADD CONSTRAINT "musical_release_alternative_artists_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "musical_releases"("release_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "musical_release_alternative_artists" ADD CONSTRAINT "musical_release_alternative_artists_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("artist_id") ON DELETE RESTRICT ON UPDATE CASCADE;
