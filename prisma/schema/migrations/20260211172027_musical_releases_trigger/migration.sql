-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

-- assuming "date" is in form "YYYY(-MM-DD)", returns it in form "YYYY-MM-DD".
-- in cases date is "incomplete" (i.e. misses DD or even MM parts) additional boolean variable "move_forward_if_incomplete" determines the result
-- if "move_forward_if_incomplete" is true, last day of month (or year) is returned. Otherwise first dat of month (or year) is returned.
-- NOTE! Behaviour of function is undefined if "date" is not in format "YYYY(-MM-DD)", or does not represent valid date in this format
CREATE OR REPLACE FUNCTION generalised_date_to_date(
	date TEXT,
	move_forward_if_incomplete BOOLEAN
)
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
	month := split_date[2];
	day := split_date[3];

	IF MONTH IS NULL THEN
		IF move_forward_if_incomplete THEN
			month = '12';
		ELSE
			month = '01';
		END IF;
	END IF;

	IF day IS NULL THEN
		IF move_forward_if_incomplete THEN
			SELECT EXTRACT(
					DAY FROM (
							make_date(year::integer, month::integer, 1) + INTERVAL '1 month' - INTERVAL '1 day'
					)
			) INTO day;
		ELSE
			day = '01';
		END IF;
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
	discogs_url_trimmed TEXT;
	comment_trimmed TEXT;
	condition_problems_trimmed TEXT;
	relation_to_queen_trimmed TEXT;
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
	ELSIF trimmed_release_alternative_name IS NOT NULL AND (entry.alternative_names IS NULL OR NEW.release_alternative_name <> ALL(entry.alternative_names)) THEN
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
		END IF;

		IF validated_release_date IS NOT NULL THEN
			IF generalised_date_to_date(validated_release_date, TRUE) < generalised_date_to_date(entry.original_release_date, FALSE) THEN
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
			END IF;

			NEW.release_date = validated_release_date;
		END IF;
	END IF;

	discogs_url_trimmed := TRIM(NEW.discogs_url);

	IF NOT discogs_url_trimmed ~ '^https://www.discogs.com/release/\d+-.' THEN
		validation_errors := add_formatted_message(
			validation_errors,
			'(Trimmed) value "%s" for "discogs_url" of release "%s" (version "%s", entry "%s", id "%s") is not valid - must be of form "https://www.discogs.com/release/(some numbers)-(arbitrary text)"',
			discogs_url_trimmed,
			NEW.release_id::TEXT,
			NEW.release_version,
			entry.main_name,
			entry.entry_id::TEXT
		);
	ELSIF discogs_url_trimmed IS DISTINCT FROM NEW.discogs_url THEN
		CALL raise_notice_with_query_id(
      'Automatically trimmed leading/trailing spaces from "discogs_url" of release "%s" (version "%s", entry "%s", id "%s"). Original: "%s", Corrected: "%s".',
      NEW.release_id::TEXT,
			NEW.release_version,
			entry.main_name,
			entry.entry_id::TEXT,
			NEW.discogs_url,
			discogs_url_trimmed
		);

		NEW.discogs_url := discogs_url_trimmed;
	END IF;

	comment_trimmed := TRIM(NEW.comment);

	IF NEW.comment IS DISTINCT FROM comment_trimmed THEN
		CALL raise_notice_with_query_id(
			'Automatically trimmed leading/trailing spaces from "comment" of release "%s" (entry "%s", id "%s"). Original: "%s", Corrected: "%s".',
			NEW.release_id::TEXT,
			entry.main_name,
			entry.entry_id::TEXT,
			NEW.comment,
			comment_trimmed
		);

		NEW.comment := comment_trimmed;
  END IF;

	condition_problems_trimmed := TRIM(NEW.condition_problems);

	IF NEW.condition_problems IS DISTINCT FROM condition_problems_trimmed THEN
		CALL raise_notice_with_query_id(
			'Automatically trimmed leading/trailing spaces from "condition_problems" of release "%s" (entry "%s", id "%s"). Original: "%s", Corrected: "%s".',
			NEW.release_id::TEXT,
			entry.main_name,
			entry.entry_id::TEXT,
			NEW.condition_problems,
			condition_problems_trimmed
		);

		NEW.condition_problems := condition_problems_trimmed;
  END IF;

	relation_to_queen_trimmed := TRIM(NEW.relation_to_queen);

	IF NOT NEW.part_of_queen_collection AND relation_to_queen_trimmed IS NOT NULL THEN
		validation_errors := add_formatted_message(
			validation_errors,
			'Value for "relation_to_queen" cannot be given if "part_of_queen_collection" is false! Release "%s" (entry "%s", id "%s").',
			NEW.release_id::TEXT,
			entry.main_name,
			entry.entry_id::TEXT
		);
	ELSIF NEW.relation_to_queen IS DISTINCT FROM relation_to_queen_trimmed THEN
		CALL raise_notice_with_query_id(
			'Automatically trimmed leading/trailing spaces from "relation_to_queen" of release "%s" (entry "%s", id "%s"). Original: "%s", Corrected: "%s".',
			NEW.release_id::TEXT,
			entry.main_name,
			entry.entry_id::TEXT,
			NEW.relation_to_queen,
			relation_to_queen_trimmed
		);

		NEW.relation_to_queen := relation_to_queen_trimmed;
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

	SELECT * FROM validate_release_countries_jsonb(
		NEW.countries,
		format(
			'Release %s (entry "%s", id "%s"), "countries" column: ',
			NEW.release_id,
			entry.main_name,
			entry.entry_id::TEXT
		),
		TRUE,
		validation_errors
	)
	INTO validation_errors, NEW.countries;

	SELECT * FROM validate_release_cat_numbers_jsonb(
		NEW.catalogue_numbers,
		format(
			'Release %s (entry "%s", id "%s"), "cat_numbers" column: ',
			NEW.release_id,
			entry.main_name,
			entry.entry_id::TEXT
		),
		TRUE,
		validation_errors
	)
	INTO validation_errors, NEW.catalogue_numbers;

	SELECT * FROM validate_release_matrix_runout_jsonb(
		NEW.matrix_runout,
		format(
			'Release %s (entry "%s", id "%s"), "matrix_runout" column: ',
			NEW.release_id,
			entry.main_name,
			entry.entry_id::TEXT
		),
		validation_errors
	)
	INTO validation_errors, NEW.matrix_runout;

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
