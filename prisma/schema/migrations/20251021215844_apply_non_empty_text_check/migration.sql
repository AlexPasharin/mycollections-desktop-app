-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema


ALTER TABLE musical_release_alternative_artists
ALTER COLUMN alternative_artist_name SET DATA TYPE NON_EMPTY_TEXT;
