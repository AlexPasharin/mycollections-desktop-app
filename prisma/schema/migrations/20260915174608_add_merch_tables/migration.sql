-- CreateTable
CREATE TABLE "musical_merch" (
    "merch_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "musical_merch_pkey" PRIMARY KEY ("merch_id")
);

-- CreateTable
CREATE TABLE "musical_merch_artists" (
    "merch_id" UUID NOT NULL,
    "artist_id" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "musical_merch_artists_merch_id_artist_id_key" ON "musical_merch_artists"("merch_id", "artist_id");

-- AddForeignKey
ALTER TABLE "musical_merch_artists" ADD CONSTRAINT "musical_merch_artists_merch_id_fkey" FOREIGN KEY ("merch_id") REFERENCES "musical_merch"("merch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "musical_merch_artists" ADD CONSTRAINT "musical_merch_artists_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("artist_id") ON DELETE RESTRICT ON UPDATE CASCADE;
