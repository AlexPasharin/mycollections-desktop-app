-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

CREATE OR REPLACE FUNCTION validate_alternative_artist_name()
RETURNS TRIGGER AS $$
DECLARE
	artist_main_name TEXT;
	name_trimmed TEXT;
BEGIN
	name_trimmed := TRIM(NEW.name);

	SELECT name INTO artist_main_name FROM artists WHERE artist_id = NEW.artist_id;

	IF artist_main_name = name_trimmed THEN
		RAISE EXCEPTION 'Alternative name of artist cannot be same as the main name of artist. Artist: %, artist name: %.',
			NEW.artist_id,
			artist_main_name;
	END IF;

    IF NEW.name IS DISTINCT FROM TRIM(name_trimmed) THEN
      RAISE NOTICE '%',
        add_query_id(
          format(
            'Automatically trimmed leading/trailing spaces from "name" of artist''s alternative name entry "%s". Original: "%s", Corrected: "%s".',
            NEW.name_id,
            NEW.name,
            TRIM(name_trimmed)
          )
        );

		NEW.name := TRIM(name_trimmed);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER validate_alternative_artist_name
BEFORE INSERT OR UPDATE OF name ON alternative_artist_names
FOR EACH ROW
EXECUTE FUNCTION validate_alternative_artist_name();
