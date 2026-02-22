-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

-- update previously defined trigger function definition
CREATE OR REPLACE FUNCTION validate_artist()
RETURNS TRIGGER AS $$
DECLARE
	name_trimmed TEXT;
	name_for_sorting_trimmed TEXT;
	other_name TEXT;
	other_names_json JSONB = '{}';
	other_name_trimmed TEXT;
	other_names_trimmed TEXT[];
	validation_errors TEXT[];
  entry_relation RECORD;
BEGIN
	name_trimmed := TRIM(NEW.name);

	IF NEW.name IS DISTINCT FROM name_trimmed THEN
	  CALL raise_notice_with_query_id(
	    'Automatically trimmed leading/trailing spaces from "name" of artist "%s". Original: "%s", Corrected: "%s".',
	    NEW.artist_id::text,
	    NEW.name,
	    name_trimmed
	  );

	  NEW.name := name_trimmed;
	END IF;

	FOREACH other_name IN ARRAY COALESCE(NEW.other_names, '{}')
	LOOP
		other_name_trimmed := TRIM(other_name);

		IF other_name_trimmed = name_trimmed THEN
			validation_errors := add_formatted_message(
				validation_errors,
				'"Other name" of artist cannot be same as its main name. Artist "%s" with id "%s", all names are trimmed.',
				NEW.name,
				NEW.artist_id::TEXT
			);
		ELSIF other_name_trimmed IS DISTINCT FROM other_name THEN
			CALL raise_notice_with_query_id(
				'Automatically trimmed leading/trailing spaces from "other_name" of artist "%s", id "%s". Original: "%s", Corrected: "%s".',
				NEW.name,
				NEW.artist_id::text,
				other_name,
				other_name_trimmed
			);
		END IF;

	    IF has_key(other_names_json, other_name_trimmed) THEN
	      CALL raise_notice_with_query_id('Duplicate "other_name" "%s" is skipped', other_name_trimmed);
	    ELSE
	      other_names_json := set_jsonb_value(other_names_json, other_name_trimmed, 'true');
	      other_names_trimmed := array_append(other_names_trimmed, other_name_trimmed);
	    END IF;
	END LOOP;

	NEW.other_names := other_names_trimmed;

	FOR entry_relation IN
		SELECT e.entry_id, e.main_name, e.part_of_queen_collection, m.entry_artist_name
		FROM musical_entries_artists AS m
		JOIN musical_entries AS e
		ON m.entry_id = e.entry_id
		WHERE m.artist_id = NEW.artist_id
	LOOP
		IF NEW.part_of_queen_family AND NOT entry_relation.part_of_queen_collection THEN
			validation_errors := add_formatted_message(
				validation_errors,
				'Artist "%s" (id "%s") is a part of Queen family, but has entry "%s" (id "%s") for which value of "part_of_queen_collection" is false',
				NEW.name,
				NEW.artist_id::TEXT,
				entry_relation.main_name,
				entry_relation.entry_id::TEXT
			);
		END IF;

		IF entry_relation.entry_artist_name IS NOT NULL AND (NEW.other_names IS NULL OR entry_relation.entry_artist_name <> ALL(NEW.other_names)) THEN
			validation_errors := add_formatted_message(
				validation_errors,
				'Artist "%s" (id "%s") has entry "%s" (id "%s"), but it''s corresponding "entry_artist_name" is not in the artist''s "other_names" list.',
				NEW.name,
				NEW.artist_id::TEXT,
				entry_relation.main_name,
				entry_relation.entry_id::TEXT
			);
		END IF;
	END LOOP;

	IF cardinality(validation_errors) > 0 THEN
		CALL array_of_errors_to_exception(validation_errors);
	END IF;

 	IF NEW.name_for_sorting IS NOT NULL THEN
		name_for_sorting_trimmed := TRIM(NEW.name_for_sorting);

		IF NEW.name_for_sorting IS DISTINCT FROM name_for_sorting_trimmed THEN
			CALL raise_notice_with_query_id(
				'Automatically trimmed leading/trailing spaces from "name for sorting" of artist "%s". Original: "%s", Corrected: "%s".',
				NEW.artist_id::text,
				NEW.name_for_sorting,
				name_for_sorting_trimmed
			);

			NEW.name_for_sorting := name_for_sorting_trimmed;
		END IF;
 	END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--update trigger definition
CREATE OR REPLACE TRIGGER validate_artists
BEFORE INSERT OR UPDATE ON artists
FOR EACH ROW
EXECUTE FUNCTION validate_artist();
