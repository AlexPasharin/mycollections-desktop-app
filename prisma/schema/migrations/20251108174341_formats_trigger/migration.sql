-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

CREATE OR REPLACE FUNCTION validate_formats()
RETURNS TRIGGER AS $$
DECLARE
	short_name_trimmed TEXT;
	description_trimmed TEXT;
BEGIN
	IF OLD.short_name <> NEW.short_name THEN
		RAISE EXCEPTION
			'It is not allowed to update short name of existing format. Original name: %, attempted new_value: %.',
			OLD.short_name,
			NEW.short_name;
	END IF;

	short_name_trimmed := TRIM(NEW.short_name);

	 IF NEW.short_name IS DISTINCT FROM short_name_trimmed THEN
		CALL raise_notice_with_query_id(
			'Automatically trimmed leading/trailing spaces from "short_name" of format. Original: "%s", Corrected: "%s".',
			NEW.short_name,
			short_name_trimmed
		);

		NEW.short_name := short_name_trimmed;
	 END IF;

	 description_trimmed := TRIM(NEW.description);

	 IF NEW.description IS DISTINCT FROM description_trimmed THEN
		CALL raise_notice_with_query_id(
			'Automatically trimmed leading/trailing spaces from "description" of format. Original: "%s", Corrected: "%s".',
			NEW.description,
			description_trimmed
		);

		NEW.description := description_trimmed;
	 END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER validate_formats
BEFORE INSERT OR UPDATE ON releases_formats
FOR EACH ROW
EXECUTE FUNCTION validate_formats();
