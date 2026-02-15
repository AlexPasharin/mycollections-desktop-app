-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

CREATE OR REPLACE FUNCTION validate_musical_entry()
RETURNS TRIGGER AS $$
DECLARE
	validation_errors TEXT[];
	validated_release_date TEXT;
	release_date_validation_errors TEXT[];
	trimmed_release_date TEXT;
	main_name_trimmed TEXT;
	alt_name TEXT;
	alt_name_trimmed TEXT;
	alt_names_dict JSONB = '{}';
	alt_names_trimmed TEXT[];
	comment_trimmed TEXT;
	discogs_url_trimmed TEXT;
	relation_to_queen_trimmed TEXT;
	artist_relation RECORD;
  release_relation RECORD;
BEGIN
	main_name_trimmed := TRIM(NEW.main_name);

	IF NEW.main_name IS DISTINCT FROM main_name_trimmed THEN
		CALL raise_notice_with_query_id(
				'Automatically trimmed leading/trailing spaces from "main name" of entry "%s". Original: "%s", Corrected: "%s".',
				NEW.entry_id::TEXT,
				NEW.main_name,
				main_name_trimmed
		);

		NEW.main_name:= main_name_trimmed;
  END IF;

	FOREACH alt_name IN ARRAY COALESCE(NEW.alternative_names, '{}')
	LOOP
		alt_name_trimmed := TRIM(alt_name);

		IF alt_name_trimmed = main_name_trimmed THEN
			validation_errors := add_formatted_message(
				validation_errors,
				'"Alternative name" of entry cannot be same as its main name. Entry "%s" with id "%s", all names are trimmed.',
				main_name_trimmed,
				NEW.entry_id::TEXT
			);
			EXIT;
		END IF;

		IF has_key(alt_names_dict, alt_name_trimmed) THEN
			CALL raise_notice_with_query_id('Duplicate "alternative_name" "%s" is skipped.', alt_name_trimmed);
		ELSE
			alt_names_dict := set_jsonb_value(alt_names_dict, alt_name_trimmed, 'true');
			alt_names_trimmed := array_append(alt_names_trimmed, alt_name_trimmed);

			IF alt_name_trimmed IS DISTINCT FROM alt_name THEN
				CALL raise_notice_with_query_id(
					'Automatically trimmed leading/trailing spaces from "alternative_name" of entry "%s", id "%s". Original: "%s", Corrected: "%s".',
					main_name_trimmed,
					NEW.entry_id::TEXT,
					alt_name,
					alt_name_trimmed
				);
			END IF;
		END IF;
	END LOOP;

	NEW.alternative_names := alt_names_trimmed;

	IF NEW.original_release_date IS NOT NULL THEN
		trimmed_release_date := TRIM(NEW.original_release_date);

		SELECT release_date_validation_results.validated_date_str, release_date_validation_results.validation_errors
		FROM validate_generalised_date(trimmed_release_date) AS release_date_validation_results
		INTO validated_release_date, release_date_validation_errors;

		IF cardinality(release_date_validation_errors) > 0 THEN
			validation_errors := validation_errors || release_date_validation_errors;
		ELSIF validated_release_date IS DISTINCT FROM NEW.original_release_date THEN
			CALL raise_notice_with_query_id(
				'Automatically formatted "original_release_date" of entry "%s", id "%s" (trimmed and added leading zeroes to month and day, if necessary). Original: "%s", Corrected: "%s".',
				main_name_trimmed,
				NEW.entry_id::TEXT,
				NEW.original_release_date,
				validated_release_date
	  	);

			NEW.original_release_date = validated_release_date;
		END IF;
	END IF;

	comment_trimmed := TRIM(NEW.comment);

	IF NEW.comment IS DISTINCT FROM comment_trimmed THEN
		CALL raise_notice_with_query_id(
			'Automatically trimmed leading/trailing spaces from "comment" of entry "%s", id "%s". Original: "%s", Corrected: "%s".',
			NEW.main_name,
			NEW.entry_id::TEXT,
			NEW.comment,
			comment_trimmed
		);

		NEW.comment := comment_trimmed;
  END IF;

	discogs_url_trimmed := TRIM(NEW.discogs_url);

	IF NOT discogs_url_trimmed ~ '^https://www.discogs.com/(master|release)/\d+-.' THEN
		validation_errors := add_formatted_message(
			validation_errors,
			'(Trimmed) value "%s" for "discogs_url" of entry "%s", id "%s", is not valid - must be of form "https://www.discogs.com/(master or release)/(some numbers)-(arbitrary text)"',
			discogs_url_trimmed,
			main_name_trimmed,
			NEW.entry_id::TEXT
		);
	ELSIF discogs_url_trimmed IS DISTINCT FROM NEW.discogs_url THEN
		CALL raise_notice_with_query_id(
        	'Automatically trimmed leading/trailing spaces from "discogs_url" of entry "%s", id "%s". Original: "%s", Corrected: "%s".',
       	 	main_name_trimmed,
					NEW.entry_id::TEXT,
					NEW.discogs_url,
					discogs_url_trimmed
       	);

		NEW.discogs_url := discogs_url_trimmed;
	END IF;

	relation_to_queen_trimmed := TRIM(NEW.relation_to_queen);

	IF NOT NEW.part_of_queen_collection AND relation_to_queen_trimmed IS NOT NULL THEN
		validation_errors := add_formatted_message(
			validation_errors,
			'Value for "relation_to_queen" cannot be given if "part_of_queen_collection" is false! Entry "%s" with id "%s".',
			main_name_trimmed,
			NEW.entry_id::TEXT
		);
	ELSIF relation_to_queen_trimmed IS DISTINCT FROM NEW.relation_to_queen THEN
		CALL raise_notice_with_query_id(
            'Automatically trimmed leading/trailing spaces from "relation_to_queen" of entry "%s", id "%s". Original: "%s", Corrected: "%s".',
            main_name_trimmed,
			NEW.entry_id::TEXT,
			NEW.relation_to_queen,
            relation_to_queen_trimmed
       	);

		NEW.relation_to_queen := relation_to_queen_trimmed;
	END IF;

	FOR artist_relation IN
		SELECT a.artist_id, a.part_of_queen_family, a.name
		FROM musical_entries_artists AS m
		JOIN artists AS a
		ON m.artist_id = a.artist_id
		WHERE entry_id = NEW.entry_id
		LOOP
			IF artist_relation.part_of_queen_family AND NOT NEW.part_of_queen_collection THEN
				validation_errors := add_formatted_message(
					validation_errors,
					'Artist "%s" (id "%s") of entry "%s" (id "%s") is a part of Queen family, but entry''s value for "part_of_queen_collection" is false',
					artist_relation.name,
					artist_relation.artist_id,
					main_name_trimmed,
					NEW.entry_id::TEXT
				);
			END IF;
		END LOOP;

  FOR release_relation IN
    SELECT *
    FROM musical_releases AS m
    WHERE m.entry_id = NEW.entry_id
    LOOP
      IF release_relation.release_alternative_name = NEW.main_name THEN
        validation_errors := add_formatted_message(
          validation_errors,
          'Release "%s" (version "%s") of entry "%s" (id "%s") -  alternative name can not be the same as entry''s main name.',
          release_relation.release_id::TEXT,
          release_relation.release_version,
          NEW.main_name,
          NEW.entry_id::TEXT
        );
      ELSIF release_relation.release_alternative_name IS NOT NULL AND NOT release_relation.release_alternative_name = ANY(NEW.alternative_names) THEN
        validation_errors := add_formatted_message(
          validation_errors,
          'Release "%s" (version "%s") of entry "%s" (id "%s") - alternative name "%s" is not among entry''s alternative names.',
          release_relation.release_id::TEXT,
          release_relation.release_version,
          NEW.main_name,
          NEW.entry_id::TEXT,
          release_relation.release_alternative_name
        );
      END IF;

      IF release_relation.release_date IS NOT NULL AND generalised_date_to_date(release_relation.release_date, TRUE) < generalised_date_to_date(NEW.original_release_date, FALSE) THEN
        validation_errors := add_formatted_message(
					validation_errors,
					'Release date ("%s") of release "%s" (version "%s", entry "%s", id "%s") cannot be before it''s entry''s original release date ("%s").',
					release_relation.release_date,
			    release_relation.release_id::TEXT,
          release_relation.release_version,
					NEW.main_name,
          NEW.entry_id::TEXT,
					NEW.original_release_date
				);
      END IF;

      IF NOT release_relation.part_of_queen_collection AND NEW.part_of_queen_collection THEN
        validation_errors := add_formatted_message(
          validation_errors,
          'Entry "%s" (id "%s") is a part of Queen collection, but has a release "%s" (version "%s") which is not marked as part of Queen collection.',
          NEW.main_name,
          NEW.entry_id::TEXT,
          release_relation.release_id::TEXT,
          release_relation.release_version
        );
      END IF
    END LOOP;

	IF cardinality(validation_errors) > 0 THEN
		CALL array_of_errors_to_exception(validation_errors);
	END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER validate_musical_entries
BEFORE INSERT OR UPDATE ON musical_entries
FOR EACH ROW
EXECUTE FUNCTION validate_musical_entry();
