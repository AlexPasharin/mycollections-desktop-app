-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

ALTER TABLE musical_releases
ALTER COLUMN release_alternative_name SET DATA TYPE NON_EMPTY_TEXT;

ALTER TABLE musical_releases
ALTER COLUMN release_version SET DATA TYPE NON_EMPTY_TEXT;

ALTER TABLE musical_releases
ALTER COLUMN comment SET DATA TYPE NON_EMPTY_TEXT;

ALTER TABLE musical_releases
ALTER COLUMN release_date SET DATA TYPE NON_EMPTY_TEXT;

ALTER TABLE musical_releases
ALTER COLUMN condition_problems SET DATA TYPE NON_EMPTY_TEXT;

ALTER TABLE musical_releases
ALTER COLUMN discogs_url SET DATA TYPE NON_EMPTY_TEXT;

ALTER TABLE musical_releases
ALTER COLUMN relation_to_queen SET DATA TYPE NON_EMPTY_TEXT;

ALTER TABLE musical_releases_formats
ALTER COLUMN description SET DATA TYPE NON_EMPTY_TEXT;

ALTER TABLE countries
ALTER COLUMN code_name SET DATA TYPE NON_EMPTY_TEXT;

ALTER TABLE countries
ALTER COLUMN name SET DATA TYPE NON_EMPTY_TEXT;

ALTER TABLE musical_release_alternative_artist
ALTER COLUMN alternative_artist_name SET DATA TYPE NON_EMPTY_TEXT;

ALTER TABLE labels
ALTER COLUMN name SET DATA TYPE NON_EMPTY_TEXT;
