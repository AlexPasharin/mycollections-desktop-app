-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

-- Enable pg_trgm extension, for substring and fuzzy matching of strings
CREATE EXTENSION pg_trgm;
