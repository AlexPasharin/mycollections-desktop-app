-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

CREATE OR REPLACE FUNCTION validate_musical_entry_types()
RETURNS TRIGGER AS $$
DECLARE
	name_trimmed TEXT;
	comment_trimmed TEXT;
BEGIN
	name_trimmed := TRIM(NEW.name);

  	IF NEW.name IS DISTINCT FROM name_trimmed THEN
		CALL raise_notice_with_query_id(
			'Automatically trimmed leading/trailing spaces from "name" of musical entry type "%s". Original: "%s", Corrected: "%s".',
			NEW.entry_type_id::TEXT,
			NEW.name,
			name_trimmed
		);

		NEW.name := name_trimmed;
  	END IF;

	comment_trimmed := TRIM(NEW.comment);

  	IF NEW.comment IS DISTINCT FROM comment_trimmed THEN
		CALL raise_notice_with_query_id(
			'Automatically trimmed leading/trailing spaces from "comment" of musical entry type "%s". Original: "%s", Corrected: "%s".',
			NEW.entry_type_id::TEXT,
			NEW.comment,
			comment_trimmed
		);

		NEW.comment := comment_trimmed;
  	END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER validate_musical_entry_types
BEFORE INSERT OR UPDATE ON musical_entry_types
FOR EACH ROW
EXECUTE FUNCTION validate_musical_entry_types();
