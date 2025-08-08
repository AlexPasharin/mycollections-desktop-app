/*
  Warnings:

  - A unique constraint covering the columns `[name,artist_id]` on the table `alternative_artist_names` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "alternative_artist_names_name_artist_id_key" ON "alternative_artist_names"("name", "artist_id");
