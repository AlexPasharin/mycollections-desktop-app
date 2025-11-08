/*
  Warnings:

  - You are about to drop the `musical_releases_formats` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."formats_of_musical_releases" DROP CONSTRAINT "formats_of_musical_releases_format_id_fkey";

-- DropTable
DROP TABLE "public"."musical_releases_formats";

-- CreateTable
CREATE TABLE "releases_formats" (
    "format_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "short_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "has_sides" BOOLEAN NOT NULL,
    "default_speed" "VINYL_SPEED",

    CONSTRAINT "releases_formats_pkey" PRIMARY KEY ("format_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "releases_formats_short_name_key" ON "releases_formats"("short_name");

-- CreateIndex
CREATE UNIQUE INDEX "releases_formats_description_key" ON "releases_formats"("description");

-- AddForeignKey
ALTER TABLE "formats_of_musical_releases" ADD CONSTRAINT "formats_of_musical_releases_format_id_fkey" FOREIGN KEY ("format_id") REFERENCES "releases_formats"("format_id") ON DELETE RESTRICT ON UPDATE CASCADE;
