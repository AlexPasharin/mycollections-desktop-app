/*
  Warnings:

  - You are about to drop the `formats_of_musical_releases` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."formats_of_musical_releases" DROP CONSTRAINT "formats_of_musical_releases_format_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."formats_of_musical_releases" DROP CONSTRAINT "formats_of_musical_releases_release_id_fkey";

-- DropTable
DROP TABLE "public"."formats_of_musical_releases";

-- CreateTable
CREATE TABLE "formats_of_releases" (
    "release_id" UUID NOT NULL,
    "format_id" UUID NOT NULL,
    "jukebox_hole" BOOLEAN NOT NULL DEFAULT false,
    "picture_sleeve" BOOLEAN NOT NULL DEFAULT true,
    "speed" JSONB,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "formats_of_releases_pkey" PRIMARY KEY ("release_id","format_id")
);

-- AddForeignKey
ALTER TABLE "formats_of_releases" ADD CONSTRAINT "formats_of_releases_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "musical_releases"("release_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formats_of_releases" ADD CONSTRAINT "formats_of_releases_format_id_fkey" FOREIGN KEY ("format_id") REFERENCES "releases_formats"("format_id") ON DELETE RESTRICT ON UPDATE CASCADE;
