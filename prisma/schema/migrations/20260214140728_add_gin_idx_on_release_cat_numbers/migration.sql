-- CreateIndex
CREATE INDEX "musical_releases_catalogue_numbers_idx" ON "musical_releases" USING GIN ("catalogue_numbers");
