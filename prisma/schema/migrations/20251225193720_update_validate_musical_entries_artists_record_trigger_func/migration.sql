-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

-- update previously defined trigger function definition
CREATE OR REPLACE FUNCTION validate_musical_entries_artists_record()
RETURNS TRIGGER AS $$
DECLARE
	artist RECORD;
	entry RECORD;
	validation_errors TEXT[];
	entry_artist_name_trimmed TEXT;
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

	entry_artist_name_trimmed := trim(NEW.entry_artist_name);

	IF entry_artist_name_trimmed IS NOT NULL AND (artist.other_names IS NULL OR NOT entry_artist_name_trimmed = ANY(artist.other_names)) THEN
		validation_errors := add_formatted_message(
			validation_errors,
			'Name "%s" given (trimmed) for entry''s entry "%s" (id "%s") artist "%s" (id "%s") is not in the artist''s "other_names" list.',
			entry_artist_name_trimmed,
			entry.main_name,
			entry.entry_id::TEXT,
			artist.name,
			artist.artist_id::TEXT
		);
	ELSIF entry_artist_name_trimmed IS DISTINCT FROM NEW.entry_artist_name THEN
		CALL raise_notice_with_query_id(
            'Automatically trimmed leading/trailing spaces from "entry_artist_name" for entry''s entry "%s" (id "%s") artist "%s" (id "%s"). Original: "%s", Corrected: "%s".',
         	entry.main_name,
			entry.entry_id::TEXT,
			artist.name,
			artist.artist_id::TEXT,
			NEW.entry_artist_name,
			entry_artist_name_trimmed
       	);

		NEW.entry_artist_name := entry_artist_name_trimmed;
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
