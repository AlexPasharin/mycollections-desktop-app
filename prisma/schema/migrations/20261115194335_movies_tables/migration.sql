-- CreateTable
CREATE TABLE "movies" (
    "movie_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "original_release_date" TEXT,
    "comment" TEXT,
    "imdb_url" TEXT,
    "part_of_queen_collection" BOOLEAN NOT NULL DEFAULT false,
    "relation_to_queen" TEXT,

    CONSTRAINT "movies_pkey" PRIMARY KEY ("movie_id")
);

-- CreateTable
CREATE TABLE "movie_releases" (
    "movie_release_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT,
    "release_version" TEXT NOT NULL,
    "release_date" TEXT,
    "catalogue_numbers" JSONB,
    "countries" JSONB,
    "matrix_runout" JSONB,
    "comment" TEXT,
    "condition_problems" TEXT,
    "part_of_queen_collection" BOOLEAN NOT NULL DEFAULT false,
    "relation_to_queen" TEXT,

    CONSTRAINT "movie_releases_pkey" PRIMARY KEY ("movie_release_id")
);

-- CreateTable
CREATE TABLE "movie_release_movies" (
    "movie_release_id" UUID NOT NULL,
    "movie_id" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "formats_of_movie_releases" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "movie_release_id" UUID NOT NULL,
    "format_id" UUID NOT NULL,
    "picture_sleeve" BOOLEAN NOT NULL DEFAULT true,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "formats_of_movie_releases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parent_movie_releases" (
    "parent_release_id" UUID NOT NULL,
    "child_release_id" UUID NOT NULL,
    "child_release_order_number" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "parent_movie_releases_pkey" PRIMARY KEY ("parent_release_id","child_release_id")
);

-- CreateTable
CREATE TABLE "parent_movie_musical_release_relations" (
    "parent_movie_release_id" UUID NOT NULL,
    "child_musical_release_id" UUID NOT NULL,
    "child_release_order_number" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "parent_movie_musical_release_relations_pkey" PRIMARY KEY ("parent_movie_release_id","child_musical_release_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "movie_release_movies_movie_release_id_movie_id_key" ON "movie_release_movies"("movie_release_id", "movie_id");

-- CreateIndex
CREATE UNIQUE INDEX "formats_of_movie_releases_movie_release_id_format_id_pictur_key" ON "formats_of_movie_releases"("movie_release_id", "format_id", "picture_sleeve");

-- AddForeignKey
ALTER TABLE "movie_release_movies" ADD CONSTRAINT "movie_release_movies_movie_release_id_fkey" FOREIGN KEY ("movie_release_id") REFERENCES "movie_releases"("movie_release_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_release_movies" ADD CONSTRAINT "movie_release_movies_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("movie_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formats_of_movie_releases" ADD CONSTRAINT "formats_of_movie_releases_movie_release_id_fkey" FOREIGN KEY ("movie_release_id") REFERENCES "movie_releases"("movie_release_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formats_of_movie_releases" ADD CONSTRAINT "formats_of_movie_releases_format_id_fkey" FOREIGN KEY ("format_id") REFERENCES "releases_formats"("format_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_movie_releases" ADD CONSTRAINT "parent_movie_releases_parent_release_id_fkey" FOREIGN KEY ("parent_release_id") REFERENCES "movie_releases"("movie_release_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_movie_releases" ADD CONSTRAINT "parent_movie_releases_child_release_id_fkey" FOREIGN KEY ("child_release_id") REFERENCES "movie_releases"("movie_release_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_movie_musical_release_relations" ADD CONSTRAINT "parent_movie_musical_release_relations_parent_movie_releas_fkey" FOREIGN KEY ("parent_movie_release_id") REFERENCES "movie_releases"("movie_release_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_movie_musical_release_relations" ADD CONSTRAINT "parent_movie_musical_release_relations_child_musical_relea_fkey" FOREIGN KEY ("child_musical_release_id") REFERENCES "musical_releases"("release_id") ON DELETE RESTRICT ON UPDATE CASCADE;
