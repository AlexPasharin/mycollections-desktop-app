-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

-- update previously defined trigger function definition
CREATE OR REPLACE FUNCTION validate_musical_entries_artists_record()
RETURNS TRIGGER AS $$
DECLARE
	artist RECORD;
	entry RECORD;
  alt_artist_name RECORD;
	validation_errors TEXT[];
BEGIN
	IF OLD.artist_id <> NEW.artist_id THEN
		validation_errors := add_formatted_message(
			validation_errors,
			'It is not allowed to update "artist_id" of existing entry-artist relationship "%s".',
			NEW.id::TEXT
		);
	END IF;

	IF OLD.entry_id <> NEW.entry_id THEN
		validation_errors := add_formatted_message(
			validation_errors,
			'It is not allowed to update "entry_id" of existing entry-artist relationship "%s".',
			NEW.id::TEXT
		);
	END IF;

	SELECT * FROM artists as a
	WHERE a.artist_id = NEW.artist_id
	INTO artist;

	SELECT * FROM musical_entries as e
	WHERE e.entry_id = NEW.entry_id
	INTO entry;

	IF artist.part_of_queen_family AND NOT entry.part_of_queen_collection THEN
		validation_errors := add_formatted_message(
			validation_errors,
			'Artist "%s" (id "%s") of entry "%s" (id "%s") is a part of Queen family, but entry''s value for "part_of_queen_collection" is false.',
			artist.name,
			artist.artist_id::TEXT,
			entry.main_name,
			entry.entry_id::TEXT
		);
	END IF;

  IF NEW.entry_artist_name_id IS NOT NULL THEN
    SELECT * FROM alternative_artist_names as a
    WHERE a.name_id = NEW.entry_artist_name_id
    INTO alt_artist_name;

    IF alt_artist_name.artist_id <> artist.artist_id THEN
      validation_errors := add_formatted_message(
        validation_errors,
        'Entry''s artist name "%s" (entry id "%s", artist id "%s") is not among alternative names of this artist.',
        alt_artist_name.name,
        NEW.entry_id::TEXT,
        NEW.artist_id::TEXT
      );
    END IF;
  END IF;

	IF cardinality(validation_errors) > 0 THEN
		CALL array_of_errors_to_exception(validation_errors);
	END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;
