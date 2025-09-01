-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

CREATE OR REPLACE FUNCTION is_non_empty_text_array(arr TEXT[])
RETURNS BOOLEAN AS $$
DECLARE
    element TEXT;
BEGIN
    IF cardinality(arr) = 0 THEN
        RETURN FALSE;
    END IF;

    FOREACH element IN ARRAY arr
    LOOP
        IF element IS NULL OR trim(element) = '' THEN
            RETURN FALSE;
        END IF;
    END LOOP;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE DOMAIN non_empty_text_array AS TEXT[]
   CHECK (
    VALUE IS NULL OR is_non_empty_text_array(VALUE)
   );

ALTER TABLE artists ALTER COLUMN other_names SET DATA TYPE non_empty_text_array;
