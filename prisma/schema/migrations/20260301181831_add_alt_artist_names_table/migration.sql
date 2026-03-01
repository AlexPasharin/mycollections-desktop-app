-- CreateTable
CREATE TABLE "alternative_artist_names" (
    "name_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "artist_id" UUID NOT NULL,

    CONSTRAINT "alternative_artist_names_pkey" PRIMARY KEY ("name_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "alternative_artist_names_name_artist_id_key" ON "alternative_artist_names"("name", "artist_id");

-- AddForeignKey
ALTER TABLE "alternative_artist_names" ADD CONSTRAINT "alternative_artist_names_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("artist_id") ON DELETE RESTRICT ON UPDATE CASCADE;
