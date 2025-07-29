-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

-- Gist index to use for case-insensitive substring and fuzzy search
CREATE INDEX "artist_alt_name_trgm_gist_idx" ON "alternative_artist_names" USING GIST (lower("name") gist_trgm_ops);

-- Gist index to use for case-insensitive substring and fuzzy search
CREATE INDEX "artist_name_trgm_gist_idx" ON "artists" USING GIST (lower("name") gist_trgm_ops);
