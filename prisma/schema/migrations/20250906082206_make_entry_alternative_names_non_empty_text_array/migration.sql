-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

ALTER TABLE musical_entries ALTER COLUMN alternative_names SET DATA TYPE non_empty_text_array;
