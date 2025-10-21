-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

CREATE OR REPLACE FUNCTION validate_musical_releases()
RETURNS TRIGGER AS $$
DECLARE
	entry RECORD;
	validation_errors TEXT[];
	trimmed_release_version TEXT;
	trimmed_release_alternative_name TEXT;
BEGIN
	SELECT * FROM musical_entries as e
	WHERE e.entry_id = NEW.entry_id
	INTO entry;

	trimmed_release_version = trim(NEW.release_version);
	trimmed_release_alternative_name = trim(NEW.release_alternative_name);

	IF trimmed_release_version IS DISTINCT FROM NEW.release_version THEN
		CALL raise_notice_with_query_id(
			'Automatically trimmed leading/trailing spaces from "version" of release "%s" (entry "%s", id "%s"). Original: "%s", Corrected: "%s".',
			NEW.release_id::TEXT,
			entry.main_name,
			entry.entry_id::TEXT,
			NEW.release_version,
			trimmed_release_version
	  	);

		 NEW.release_version = trimmed_release_version;
	END IF;

	IF trimmed_release_alternative_name = entry.main_name THEN
		validation_errors := add_formatted_message(
			validation_errors,
			'Release''s "%s" (version "%s") of entry "%s" (id "%s") alternative name can not be the same as entry''s main name.',
			NEW.release_id::TEXT,
			NEW.release_version,
			entry.main_name,
			entry.entry_id::TEXT
		);
	ELSIF trimmed_release_alternative_name IS NOT NULL AND NOT NEW.release_alternative_name = ANY(entry.alternative_names) THEN
		validation_errors := add_formatted_message(
			validation_errors,
			'Release''s "%s" (version "%s") of entry "%s" (id "%s") alternative name "%s" is not among entry''s alternative names.',
			NEW.release_id::TEXT,
			NEW.release_version,
			entry.main_name,
			entry.entry_id::TEXT,
			trimmed_release_alternative_name
		);
	ELSIF trimmed_release_alternative_name IS DISTINCT FROM NEW.release_alternative_name THEN
		CALL raise_notice_with_query_id(
			'Automatically trimmed leading/trailing spaces from "release_alternative_name" of release "%s" (version "%s") of entry "%s" (id "%s"). Original: "%s", Corrected: "%s".',
			NEW.release_id::TEXT,
			NEW.release_version,
			NEW.release_alternative_name,
			trimmed_release_alternative_name
	  	);
	END IF;

	IF entry.part_of_queen_collection AND NOT NEW.part_of_queen_collection THEN
		validation_errors := add_formatted_message(
			validation_errors,
			'Entry "%s" (id "%s") of release "%s" (version "%s") is a part of Queen collection, but release is not marked as part of Queen collection.',
			entry.main_name,
			entry.entry_id::TEXT,
			NEW.release_id::TEXT,
			NEW.release_version
		);
	END IF;

	IF cardinality(validation_errors) > 0 THEN
		CALL array_of_errors_to_exception(validation_errors);
	END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER validate_musical_releases
BEFORE INSERT OR UPDATE ON musical_releases
FOR EACH ROW
EXECUTE FUNCTION validate_musical_releases();
