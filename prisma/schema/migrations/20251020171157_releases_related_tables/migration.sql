-- CreateTable
CREATE TABLE "musical_releases" (
    "release_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "release_alternative_name" TEXT,
    "release_version" TEXT NOT NULL,
    "release_date" TEXT,
    "discogs_url" TEXT,
    "countries" JSONB,
    "catalogue_numbers" JSONB,
    "matrix_runout" JSONB,
    "comment" TEXT,
    "condition_problems" TEXT,
    "part_of_queen_collection" BOOLEAN NOT NULL DEFAULT false,
    "relation_to_queen" TEXT,
    "entry_id" UUID NOT NULL,

    CONSTRAINT "musical_releases_pkey" PRIMARY KEY ("release_id")
);

-- CreateTable
CREATE TABLE "musical_releases_formats" (
    "format_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "description" TEXT NOT NULL,
    "hasSides" BOOLEAN NOT NULL,

    CONSTRAINT "musical_releases_formats_pkey" PRIMARY KEY ("format_id")
);

-- CreateTable
CREATE TABLE "formats_of_musical_releases" (
    "release_id" UUID NOT NULL,
    "format_id" UUID NOT NULL,
    "jukebox_hole" BOOLEAN NOT NULL DEFAULT false,
    "picture_sleeve" BOOLEAN NOT NULL DEFAULT true,
    "speed" JSONB,

    CONSTRAINT "formats_of_musical_releases_pkey" PRIMARY KEY ("release_id","format_id")
);

-- CreateTable
CREATE TABLE "countries" (
    "code_name" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("code_name")
);

-- CreateTable
CREATE TABLE "musical_release_alternative_artist" (
    "release_id" UUID NOT NULL,
    "artist_id" UUID NOT NULL,
    "alternative_artist_name" TEXT,

    CONSTRAINT "musical_release_alternative_artist_pkey" PRIMARY KEY ("release_id","artist_id")
);

-- CreateTable
CREATE TABLE "parent_musical_releases" (
    "parent_entry_id" UUID NOT NULL,
    "child_entry_id" UUID NOT NULL,

    CONSTRAINT "parent_musical_releases_pkey" PRIMARY KEY ("parent_entry_id","child_entry_id")
);

-- CreateTable
CREATE TABLE "labels" (
    "label_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,

    CONSTRAINT "labels_pkey" PRIMARY KEY ("label_id")
);

-- CreateTable
CREATE TABLE "musical_releases_tags" (
    "release_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "musical_releases_tags_pkey" PRIMARY KEY ("release_id","tag_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "musical_releases_formats_description_key" ON "musical_releases_formats"("description");

-- CreateIndex
CREATE UNIQUE INDEX "countries_name_key" ON "countries"("name");

-- CreateIndex
CREATE UNIQUE INDEX "labels_name_key" ON "labels"("name");

-- AddForeignKey
ALTER TABLE "musical_releases" ADD CONSTRAINT "musical_releases_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "musical_entries"("entry_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formats_of_musical_releases" ADD CONSTRAINT "formats_of_musical_releases_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "musical_releases"("release_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formats_of_musical_releases" ADD CONSTRAINT "formats_of_musical_releases_format_id_fkey" FOREIGN KEY ("format_id") REFERENCES "musical_releases_formats"("format_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "musical_release_alternative_artist" ADD CONSTRAINT "musical_release_alternative_artist_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "musical_releases"("release_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "musical_release_alternative_artist" ADD CONSTRAINT "musical_release_alternative_artist_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("artist_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_musical_releases" ADD CONSTRAINT "parent_musical_releases_parent_entry_id_fkey" FOREIGN KEY ("parent_entry_id") REFERENCES "musical_releases"("release_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_musical_releases" ADD CONSTRAINT "parent_musical_releases_child_entry_id_fkey" FOREIGN KEY ("child_entry_id") REFERENCES "musical_releases"("release_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "musical_releases_tags" ADD CONSTRAINT "musical_releases_tags_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "musical_releases"("release_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "musical_releases_tags" ADD CONSTRAINT "musical_releases_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("tag_id") ON DELETE RESTRICT ON UPDATE CASCADE;
