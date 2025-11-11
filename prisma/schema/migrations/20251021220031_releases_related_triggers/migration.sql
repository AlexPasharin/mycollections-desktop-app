-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

-- assuming "date" is in form "YYYY(-MM-DD)", returns it in form "YYYY-MM-DD".
-- in cases date is "incomplete" (i.e. misses DD or even MM parts), last day of month (or year) is returned
-- NOTE! Behaviour of function is undefined if "date" is not in format "YYYY(-MM-DD)", or does not represent valid date in this format
CREATE OR REPLACE FUNCTION generalised_date_to_date(date TEXT)
RETURNS TEXT AS $$
DECLARE
	split_date TEXT[];
	year TEXT;
	month TEXT;
	day TEXT;
BEGIN
	IF date IS NULL THEN
		RETURN NULL;
	END IF;

	split_date := string_to_array(date, '-');

	year := split_date[1];
	month := coalesce(split_date[2], '12');
	day := split_date[3];

	IF day IS NULL THEN
		SELECT EXTRACT(
		    DAY FROM (
		        make_date(year::integer, month::integer, 1) + INTERVAL '1 month' - INTERVAL '1 day'
		    )
		) INTO day;
	END IF;

	RETURN array_to_string(ARRAY[year, month, day], '-');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_musical_releases()
RETURNS TRIGGER AS $$
DECLARE
	entry RECORD;
	validation_errors TEXT[];
	trimmed_release_version TEXT;
	trimmed_release_alternative_name TEXT;
	validated_release_date TEXT;
	release_date_validation_errors TEXT[];
	trimmed_release_date TEXT;
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

		NEW.release_alternative_name = trimmed_release_alternative_name;
	END IF;

	IF NEW.release_date IS NOT NULL THEN
		trimmed_release_date := TRIM(NEW.release_date);

		SELECT release_date_validation_results.validated_date_str, release_date_validation_results.validation_errors
		FROM validate_generalised_date(trimmed_release_date) AS release_date_validation_results
		INTO validated_release_date, release_date_validation_errors;

		IF cardinality(release_date_validation_errors) > 0 THEN
			validation_errors := validation_errors || release_date_validation_errors;
		ELSIF generalised_date_to_date(validated_release_date) < generalised_date_to_date(entry.original_release_date) THEN
			validation_errors := add_formatted_message(
				validation_errors,
				'Release date ("%s") of release "%s" (version "%s", entry "%s", id "%s") cannot be before it''s entry''s original release date ("%s").',
				validated_release_date,
				NEW.release_id::TEXT,
				NEW.release_version,
				entry.main_name,
				entry.entry_id::TEXT,
				entry.original_release_date
			);
		ELSIF validated_release_date IS DISTINCT FROM NEW.release_date THEN
			CALL raise_notice_with_query_id(
				'Automatically formatted "release_date" of release "%s" (version "%s", entry "%s", id "%s") (trimmed and added leading zeroes to month and day, if necessary). Original: "%s", Corrected: "%s".',
				NEW.release_id::TEXT,
				NEW.release_version,
				entry.main_name,
				entry.entry_id::TEXT,
				NEW.release_date,
				validated_release_date
	  		);

			NEW.release_date = validated_release_date;
		END IF;
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
