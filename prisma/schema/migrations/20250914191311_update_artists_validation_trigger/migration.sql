-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

CREATE OR REPLACE FUNCTION validate_artist()
RETURNS TRIGGER AS $$
DECLARE
	name_trimmed TEXT;
	name_for_sorting_trimmed TEXT;
	other_name TEXT;
	other_names_json JSONB = '{}';
	other_name_trimmed TEXT;
	other_names_trimmed TEXT[];
BEGIN
	name_trimmed := TRIM(NEW.name);

	FOREACH other_name IN ARRAY COALESCE(NEW.other_names, '{}')
	LOOP
		other_name_trimmed := TRIM(other_name);

		IF other_name_trimmed = name_trimmed THEN
			RAiSE EXCEPTION '"Other name" of artist cannot be same as its main name. Artist "%" with id "%", all names are trimmed.', name_trimmed, NEW.artist_id;
		END IF;

		IF other_name_trimmed IS DISTINCT FROM other_name THEN
			CALL raise_notice_with_query_id(
				'Automatically trimmed leading/trailing spaces from "other_name" of artist "%s", id "%s". Original: "%s", Corrected: "%s".',
				name_trimmed,
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

  IF NEW.name IS DISTINCT FROM name_trimmed THEN
  CALL raise_notice_with_query_id(
    'Automatically trimmed leading/trailing spaces from "name" of artist "%s". Original: "%s", Corrected: "%s".',
    NEW.artist_id::text,
    NEW.name,
    name_trimmed
  );

  NEW.name := name_trimmed;
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

CREATE OR REPLACE TRIGGER validate_artists
BEFORE INSERT OR UPDATE OF name, name_for_sorting, other_names ON artists
FOR EACH ROW
EXECUTE FUNCTION validate_artist();
