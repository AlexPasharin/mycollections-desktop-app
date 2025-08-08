-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

CREATE OR REPLACE FUNCTION add_query_id(text TEXT)
RETURNS TEXT AS $$
DECLARE
	query_id TEXT;
BEGIN
	query_id := current_setting('app.query_id', true);

	IF query_id IS NULL OR query_id = '' THEN
		RETURN text;
	END IF;

	RETURN format('id:%s:%s', query_id, text);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_artist()
RETURNS TRIGGER AS $$
DECLARE
	name_trimmed TEXT;
	name_for_sorting_trimmed TEXT;
BEGIN
	name_trimmed := TRIM(NEW.name);

    IF NEW.name IS DISTINCT FROM name_trimmed THEN
        RAISE NOTICE '%',
			add_query_id(
				format(
					'Automatically trimmed leading/trailing spaces from "name" of artist "%s". Original: "%s", Corrected: "%s"',
				 	NEW.artist_id,
				 	NEW.name,
				 	name_trimmed
				)
			);

		NEW.name := name_trimmed;
    END IF;

	IF NEW.name_for_sorting IS NOT NULL THEN
		name_for_sorting_trimmed := TRIM(NEW.name_for_sorting);

		IF NEW.name_for_sorting IS DISTINCT FROM name_for_sorting_trimmed THEN
			RAISE NOTICE '%',
				add_query_id(
					format(
						'Automatically trimmed leading/trailing spaces from "name for sorting" of artist "%s". Original: "%s", Corrected: "%s"',
					 	NEW.artist_id,
					 	NEW.name_for_sorting,
					 	name_for_sorting_trimmed
					)
				);

			NEW.name_for_sorting := name_for_sorting_trimmed;
		END IF;
	END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER validate_artists
BEFORE INSERT OR UPDATE OF name, name_for_sorting ON artists
FOR EACH ROW
EXECUTE FUNCTION validate_artist();
