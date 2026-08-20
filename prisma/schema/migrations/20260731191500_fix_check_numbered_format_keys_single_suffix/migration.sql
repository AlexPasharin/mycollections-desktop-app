-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

-- fix to ensure that a lone numbered key (e.g. just "CD1") is invalid; only an unnumbered single key
-- (e.g. "CD") or a numbered sequence of two or more keys (e.g. "CD1", "CD2") is allowed.
CREATE OR REPLACE FUNCTION check_numbered_format_keys(
	keys TEXT[]
) RETURNS BOOLEAN
AS $$
DECLARE
	numbers TEXT[];
	is_sequential BOOLEAN;
BEGIN
	IF keys IS NULL OR cardinality(keys) = 0 THEN
		RETURN TRUE;
	END IF;

	SELECT ARRAY(
		SELECT COALESCE((regexp_match(k, '(\d+)$'))[1], '')
		FROM unnest(keys) AS k
	) INTO numbers;

	IF cardinality(keys) = 1 THEN
		RETURN numbers[1] = '';
	END IF;

	IF '' = ANY(numbers) THEN
		RETURN FALSE;
	END IF;

	IF '1' != ALL(numbers) THEN
		RETURN FALSE;
	END IF;

	SELECT MAX(n::int) = COUNT(numbers)
	FROM unnest(numbers) AS n INTO is_sequential;

	RETURN is_sequential;
END
$$ LANGUAGE plpgsql;
