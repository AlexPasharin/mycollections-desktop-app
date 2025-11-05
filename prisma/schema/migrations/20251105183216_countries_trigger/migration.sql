-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

CREATE OR REPLACE FUNCTION validate_countries()
RETURNS TRIGGER AS $$
DECLARE
	code_name_trimmed TEXT;
	name_trimmed TEXT;
BEGIN
	IF OLD.code_name <> NEW.code_name THEN
		RAISE EXCEPTION
			'It is not allowed to update code_name of existing country. Original code_name: %, attempted new_value: %.',
			OLD.code_name,
			NEW.code_name;
	END IF;

	code_name_trimmed := UPPER(TRIM(NEW.code_name));

	IF NOT code_name_trimmed ~ '^[A-Z]+$' THEN
		RAISE EXCEPTION
			'Value "%" for "code_name"  of country is in valid - must contain only English alphabet letters (after trimming).',
			NEW.code_name;
	END IF;

  	IF NEW.code_name IS DISTINCT FROM code_name_trimmed THEN
		CALL raise_notice_with_query_id(
			'Automatically trimmed leading/trailing spaces from "code_name" and made it uppercase. Original: "%s", Corrected: "%s".',
			NEW.code_name,
			code_name_trimmed
		);

		NEW.code_name := code_name_trimmed;
  	END IF;

	name_trimmed := TRIM(NEW.name);

  	IF NEW.name IS DISTINCT FROM name_trimmed THEN
		CALL raise_notice_with_query_id(
			'Automatically trimmed leading/trailing spaces from "name" of country "%s". Original: "%s", Corrected: "%s".',
			NEW.code_name,
			NEW.name,
			name_trimmed
		);

		NEW.name := name_trimmed;
  	END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER validate_countries
BEFORE INSERT OR UPDATE ON countries
FOR EACH ROW
EXECUTE FUNCTION validate_countries();
