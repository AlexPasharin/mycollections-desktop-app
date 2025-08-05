-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

ALTER TABLE musical_entries
ALTER COLUMN main_name SET DATA TYPE NON_EMPTY_TEXT;

ALTER TABLE musical_entries
ALTER COLUMN original_release_date SET DATA TYPE NON_EMPTY_TEXT;

ALTER TABLE musical_entries
ALTER COLUMN comment SET DATA TYPE NON_EMPTY_TEXT;

ALTER TABLE musical_entries
ALTER COLUMN discogs_url SET DATA TYPE NON_EMPTY_TEXT;

ALTER TABLE musical_entries
ALTER COLUMN relation_to_queen SET DATA TYPE NON_EMPTY_TEXT;

ALTER TABLE musical_entry_types
ALTER COLUMN name SET DATA TYPE NON_EMPTY_TEXT;

ALTER TABLE musical_entry_types
ALTER COLUMN comment SET DATA TYPE NON_EMPTY_TEXT;

ALTER TABLE alternative_musical_entry_names
ALTER COLUMN name SET DATA TYPE NON_EMPTY_TEXT;

ALTER TABLE tags
ALTER COLUMN tag SET DATA TYPE NON_EMPTY_TEXT;
