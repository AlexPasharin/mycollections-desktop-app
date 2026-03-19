-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

CREATE OR REPLACE FUNCTION  validate_alternative_entry_name()
RETURNS TRIGGER AS $$
DECLARE
	entry_main_name TEXT;
	name_trimmed TEXT;
BEGIN
  IF OLD.entry_id <> NEW.entry_id THEN
		RAISE EXCEPTION 'It is not allowed to update "entry_id" of existing "entry alt names" record "%s".',
			NEW.name_id::TEXT;
	END IF;

	name_trimmed := TRIM(NEW.name);

	SELECT main_name INTO entry_main_name FROM musical_entries WHERE entry_id = NEW.entry_id;

	IF entry_main_name = name_trimmed THEN
		RAISE EXCEPTION 'Alternative name of entry cannot be same as the main name of entry. Entry: %, entry name: %.',
			NEW.entry_id,
			entry_main_name;
	END IF;

  IF NEW.name IS DISTINCT FROM name_trimmed THEN
   CALL raise_notice_with_query_id(
        'Automatically trimmed leading/trailing spaces from "name" of entry''s alternative name "%s". Original: "%s", Corrected: "%s".',
        NEW.name_id::text,
        NEW.name,
        name_trimmed
    );

    NEW.name := name_trimmed;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER  validate_alternative_entry_name
BEFORE INSERT OR UPDATE ON alternative_musical_entry_names
FOR EACH ROW
EXECUTE FUNCTION validate_alternative_entry_name();
