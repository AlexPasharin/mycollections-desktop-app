-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

CREATE DOMAIN NON_EMPTY_TEXT_ARRAY AS NON_EMPTY_TEXT[]
CHECK (
    cardinality(VALUE) > 0
);

ALTER TABLE artists
ALTER COLUMN other_names SET DATA TYPE NON_EMPTY_TEXT_ARRAY;
