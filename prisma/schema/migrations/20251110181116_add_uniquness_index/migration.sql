/*
  Warnings:

  - A unique constraint covering the columns `[release_id,format_id,jukebox_hole,picture_sleeve,speed]` on the table `formats_of_releases` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "formats_of_releases_release_id_format_id_jukebox_hole_pictu_key" ON "formats_of_releases"("release_id", "format_id", "jukebox_hole", "picture_sleeve", "speed");
