-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

ALTER TABLE alternative_musical_entry_names
ALTER COLUMN name SET DATA TYPE NON_EMPTY_TEXT;

-- Gist index to use for case-insensitive substring and fuzzy search
CREATE INDEX "musical_entry_alt_name_trgm_gist_idx" ON "alternative_musical_entry_names" USING GIST (lower("name") gist_trgm_ops);
