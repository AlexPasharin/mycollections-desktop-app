-- CreateEnum
CREATE TYPE "ArtistType" AS ENUM ('BAND', 'ARTIST', 'ORCHESTRA', 'DUET', 'SHOW_CAST', 'COMPOSER', 'SONG_WRITER', 'SONG_WRITER_TEAM', 'DIRECTOR', 'SERIES_CREATOR', 'COLLABORATION', 'CHOREOGRAPHER', 'CONDUCTOR', 'VARIOUS_ARTISTS');

-- CreateTable
CREATE TABLE "artists" (
    "artist_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "name_for_sorting" TEXT,
    "part_of_queen_family" BOOLEAN NOT NULL DEFAULT false,
    "type" "ArtistType" NOT NULL,

    CONSTRAINT "artists_pkey" PRIMARY KEY ("artist_id")
);

-- CreateTable
CREATE TABLE "alternative_artist_names" (
    "name_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "artist_id" UUID NOT NULL,

    CONSTRAINT "alternative_artist_names_pkey" PRIMARY KEY ("name_id")
);

-- CreateTable
CREATE TABLE "parent_artists" (
    "parent_artist_id" UUID NOT NULL,
    "child_artist_id" UUID NOT NULL,

    CONSTRAINT "parent_artists_pkey" PRIMARY KEY ("parent_artist_id","child_artist_id")
);

-- CreateIndex
CREATE INDEX "artists_name_idx" ON "artists"("name");

-- CreateIndex
CREATE INDEX "alternative_artist_names_name_idx" ON "alternative_artist_names"("name");

-- AddForeignKey
ALTER TABLE "alternative_artist_names" ADD CONSTRAINT "alternative_artist_names_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("artist_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_artists" ADD CONSTRAINT "parent_artists_parent_artist_id_fkey" FOREIGN KEY ("parent_artist_id") REFERENCES "artists"("artist_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_artists" ADD CONSTRAINT "parent_artists_child_artist_id_fkey" FOREIGN KEY ("child_artist_id") REFERENCES "artists"("artist_id") ON DELETE RESTRICT ON UPDATE CASCADE;
