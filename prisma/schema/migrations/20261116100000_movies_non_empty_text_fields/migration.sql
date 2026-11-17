-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

ALTER TABLE movies
ALTER COLUMN name SET DATA TYPE NON_EMPTY_TEXT;

ALTER TABLE movies
ALTER COLUMN original_release_date SET DATA TYPE NON_EMPTY_TEXT;

ALTER TABLE movies
ALTER COLUMN comment SET DATA TYPE NON_EMPTY_TEXT;

ALTER TABLE movies
ALTER COLUMN imdb_url SET DATA TYPE NON_EMPTY_TEXT;

ALTER TABLE movies
ALTER COLUMN relation_to_queen SET DATA TYPE NON_EMPTY_TEXT;

ALTER TABLE movie_releases
ALTER COLUMN name SET DATA TYPE NON_EMPTY_TEXT;

ALTER TABLE movie_releases
ALTER COLUMN release_version SET DATA TYPE NON_EMPTY_TEXT;

ALTER TABLE movie_releases
ALTER COLUMN release_date SET DATA TYPE NON_EMPTY_TEXT;

ALTER TABLE movie_releases
ALTER COLUMN comment SET DATA TYPE NON_EMPTY_TEXT;

ALTER TABLE movie_releases
ALTER COLUMN condition_problems SET DATA TYPE NON_EMPTY_TEXT;

ALTER TABLE movie_releases
ALTER COLUMN relation_to_queen SET DATA TYPE NON_EMPTY_TEXT;
