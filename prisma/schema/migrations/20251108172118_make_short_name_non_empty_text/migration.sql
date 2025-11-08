-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

ALTER TABLE musical_releases_formats
ALTER COLUMN short_name SET DATA TYPE NON_EMPTY_TEXT;
