-- CreateIndex
CREATE INDEX "musical_releases_countries_idx" ON "musical_releases" USING GIN ("countries");
