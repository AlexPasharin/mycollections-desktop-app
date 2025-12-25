-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

-- update previously defined trigger function definition
CREATE OR REPLACE FUNCTION validate_musical_entries_artists_record()
RETURNS TRIGGER AS $$
DECLARE
	artist RECORD;
	entry RECORD;
	validation_errors TEXT[];
BEGIN
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

	IF NEW.entry_artist_name IS NOT NULL AND (artist.other_names IS NULL OR NOT NEW.entry_artist_name = ANY(artist.other_names)) THEN
		validation_errors := add_formatted_message(
			validation_errors,
			'Name "%s" given for entry''s entry "%s" (id "%s") artist "%s" (id "%s") is not in the artist''s "other_names" list.',
			NEW.entry_artist_name,
			entry.main_name,
			entry.entry_id::TEXT,
			artist.name,
			artist.artist_id::TEXT
		);
	END IF;

	IF cardinality(validation_errors) > 0 THEN
		CALL array_of_errors_to_exception(validation_errors);
	END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- add non empty check to column
ALTER TABLE musical_entries_artists
ALTER COLUMN entry_artist_name SET DATA TYPE NON_EMPTY_TEXT;
