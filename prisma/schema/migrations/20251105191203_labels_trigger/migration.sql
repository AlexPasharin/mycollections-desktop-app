-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

CREATE OR REPLACE FUNCTION validate_labels()
RETURNS TRIGGER AS $$
DECLARE
	name_trimmed TEXT;
BEGIN
	IF OLD.name <> NEW.name THEN
		RAISE EXCEPTION
			'It is not allowed to update name of existing label. Original name: %, attempted new_value: %.',
			OLD.name,
			NEW.name;
	END IF;

	name_trimmed := TRIM(NEW.name);

  IF NEW.name IS DISTINCT FROM name_trimmed THEN
		CALL raise_notice_with_query_id(
			'Automatically trimmed leading/trailing spaces from "name" of label. Original: "%s", Corrected: "%s".',
			NEW.name,
			name_trimmed
		);

		NEW.name := name_trimmed;
  END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER validate_labels
BEFORE INSERT OR UPDATE ON labels
FOR EACH ROW
EXECUTE FUNCTION validate_labels();
