-- DropIndex
DROP INDEX "alternative_artist_names_name_idx";

-- DropIndex
DROP INDEX "artists_name_idx";

-- CreateTable
CREATE TABLE "musical_entries" (
    "entry_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "main_name" TEXT NOT NULL,
    "original_release_date" TEXT,
    "comment" TEXT,
    "discogs_url" TEXT,
    "partOfQueenCollection" BOOLEAN NOT NULL DEFAULT false,
    "relation_to_queen" TEXT,

    CONSTRAINT "musical_entries_pkey" PRIMARY KEY ("entry_id")
);

-- CreateTable
CREATE TABLE "musical_entry_types" (
    "entry_type_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,

    CONSTRAINT "musical_entry_types_pkey" PRIMARY KEY ("entry_type_id")
);

-- CreateTable
CREATE TABLE "types_of_musical_entries" (
    "entry_id" UUID NOT NULL,
    "type_id" UUID NOT NULL,

    CONSTRAINT "types_of_musical_entries_pkey" PRIMARY KEY ("entry_id","type_id")
);

-- CreateTable
CREATE TABLE "musical_entries_artists" (
    "entry_id" UUID NOT NULL,
    "artist_id" UUID NOT NULL,
    "entry_artist_name" TEXT,
    "is_entries_main_artist" BOOLEAN DEFAULT true,

    CONSTRAINT "musical_entries_artists_pkey" PRIMARY KEY ("entry_id","artist_id")
);

-- CreateTable
CREATE TABLE "parent_musical_entries" (
    "parent_artist_id" UUID NOT NULL,
    "child_artist_id" UUID NOT NULL,

    CONSTRAINT "parent_musical_entries_pkey" PRIMARY KEY ("parent_artist_id","child_artist_id")
);

-- CreateTable
CREATE TABLE "alternative_musical_entry_names" (
    "name_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "entry_id" UUID NOT NULL,

    CONSTRAINT "alternative_musical_entry_names_pkey" PRIMARY KEY ("name_id")
);

-- CreateTable
CREATE TABLE "tags" (
    "tag_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tag" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("tag_id")
);

-- CreateTable
CREATE TABLE "musical_entries_tags" (
    "entry_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "musical_entries_tags_pkey" PRIMARY KEY ("entry_id","tag_id")
);

-- AddForeignKey
ALTER TABLE "types_of_musical_entries" ADD CONSTRAINT "types_of_musical_entries_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "musical_entries"("entry_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "types_of_musical_entries" ADD CONSTRAINT "types_of_musical_entries_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "musical_entry_types"("entry_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "musical_entries_artists" ADD CONSTRAINT "musical_entries_artists_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "musical_entries"("entry_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "musical_entries_artists" ADD CONSTRAINT "musical_entries_artists_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("artist_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_musical_entries" ADD CONSTRAINT "parent_musical_entries_parent_artist_id_fkey" FOREIGN KEY ("parent_artist_id") REFERENCES "musical_entries"("entry_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_musical_entries" ADD CONSTRAINT "parent_musical_entries_child_artist_id_fkey" FOREIGN KEY ("child_artist_id") REFERENCES "musical_entries"("entry_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alternative_musical_entry_names" ADD CONSTRAINT "alternative_musical_entry_names_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "musical_entries"("entry_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "musical_entries_tags" ADD CONSTRAINT "musical_entries_tags_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "musical_entries"("entry_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "musical_entries_tags" ADD CONSTRAINT "musical_entries_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("tag_id") ON DELETE RESTRICT ON UPDATE CASCADE;
