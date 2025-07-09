-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

-- this index is created to speed up artists paginated retrieval, using parts of this index in query's order by and
CREATE INDEX artists_sorting_index ON artists (LOWER(COALESCE(name_for_sorting, name)), (artist_id::text));
