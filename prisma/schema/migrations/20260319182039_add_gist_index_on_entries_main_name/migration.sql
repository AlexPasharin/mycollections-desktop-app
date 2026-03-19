-- This is an empty migration.-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

-- Gist index to use for case-insensitive substring and fuzzy search
CREATE INDEX "entries_main_name_trgm_gist_idx" ON "musical_entries" USING GIST (lower("main_name") gist_trgm_ops);
