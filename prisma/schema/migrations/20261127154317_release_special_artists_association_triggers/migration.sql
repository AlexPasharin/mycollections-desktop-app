-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

-- True when the entry already has this artist associated with the same alternative name
-- (NULL entry_artist_name_id matches NULL — IS NOT DISTINCT FROM).
CREATE OR REPLACE FUNCTION entry_has_matching_artist_association(
	p_entry_id UUID,
	p_artist_id UUID,
	p_entry_artist_name_id UUID
) RETURNS BOOLEAN
AS $$
	SELECT EXISTS (
		SELECT 1
		FROM musical_entries_artists AS ea
		WHERE ea.entry_id = p_entry_id
			AND ea.artist_id = p_artist_id
			AND ea.entry_artist_name_id IS NOT DISTINCT FROM p_entry_artist_name_id
	);
$$ LANGUAGE sql STABLE;

-- musical_release_special_artists: row is allowed only when the artist is NOT associated
-- with the release's entry, OR is associated but under a different entry_artist_name_id
-- (including the NULL vs non-NULL distinction).
CREATE OR REPLACE FUNCTION validate_musical_release_special_artists()
RETURNS TRIGGER AS $$
DECLARE
	release_row RECORD;
	entry_row RECORD;
	validation_errors TEXT[];
BEGIN
	SELECT * FROM musical_releases AS r
	WHERE r.release_id = NEW.release_id
	INTO release_row;

	IF entry_has_matching_artist_association(
		release_row.entry_id,
		NEW.artist_id,
		NEW.entry_artist_name_id
	) THEN

		SELECT * FROM musical_entries AS e
		WHERE e.entry_id = release_row.entry_id
		INTO entry_row;

		validation_errors := add_formatted_message(
			validation_errors,
			'Release special artist (release "%s", version "%s", artist id "%s", entry_artist_name_id "%s") is not allowed: this artist is already associated with the release''s entry "%s" (id "%s") under the same alternative name (including both-null).',
			NEW.release_id::TEXT,
			release_row.release_version,
			NEW.artist_id::TEXT,
			COALESCE(NEW.entry_artist_name_id::TEXT, 'null'),
			entry_row.main_name,
			entry_row.entry_id::TEXT
		);
	END IF;

	IF cardinality(validation_errors) > 0 THEN
		CALL array_of_errors_to_exception(validation_errors);
	END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER validate_musical_release_special_artists
BEFORE INSERT OR UPDATE ON musical_release_special_artists
FOR EACH ROW
EXECUTE FUNCTION validate_musical_release_special_artists();

-- musical_entries_artists: updating an association must not make an existing
-- release special artist of that entry invalid under the same rule.
CREATE OR REPLACE FUNCTION validate_musical_entries_artists_against_release_special_artists()
RETURNS TRIGGER AS $$
DECLARE
	conflicting_special_artist RECORD;
	entry_row RECORD;
	release_row RECORD;
	validation_errors TEXT[];
BEGIN
	SELECT * FROM musical_entries AS e
	WHERE e.entry_id = NEW.entry_id
	INTO entry_row;

	FOR conflicting_special_artist IN
		SELECT sa.*
		FROM musical_release_special_artists AS sa
		INNER JOIN musical_releases AS r ON r.release_id = sa.release_id
		WHERE r.entry_id = NEW.entry_id
			AND sa.artist_id = NEW.artist_id
			AND sa.entry_artist_name_id IS NOT DISTINCT FROM NEW.entry_artist_name_id
	LOOP
		SELECT * FROM musical_releases AS r
		WHERE r.release_id = conflicting_special_artist.release_id
		INTO release_row;

		validation_errors := add_formatted_message(
			validation_errors,
			'Cannot update entry-artist association (entry "%s", id "%s", artist id "%s", entry_artist_name_id "%s"): it would duplicate release special artist on release "%s" (version "%s"). A special artist is only allowed when the artist is not on the entry, or is on the entry under a different alternative name (including null).',
			entry_row.main_name,
			NEW.entry_id::TEXT,
			NEW.artist_id::TEXT,
			COALESCE(NEW.entry_artist_name_id::TEXT, 'null'),
			release_row.release_id::TEXT,
			release_row.release_version
		);
	END LOOP;

	IF cardinality(validation_errors) > 0 THEN
		CALL array_of_errors_to_exception(validation_errors);
	END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER validate_musical_entries_artists_against_release_special_artists
BEFORE UPDATE ON musical_entries_artists
FOR EACH ROW
EXECUTE FUNCTION validate_musical_entries_artists_against_release_special_artists();

-- musical_releases: changing entry_id must not leave special artists that match
-- associations already present on the new entry.
CREATE OR REPLACE FUNCTION validate_musical_releases_special_artists_on_entry_change()
RETURNS TRIGGER AS $$
DECLARE
	conflicting_special_artist RECORD;
	entry_row RECORD;
	validation_errors TEXT[];
BEGIN
	IF OLD.entry_id IS NOT DISTINCT FROM NEW.entry_id THEN
		RETURN NEW;
	END IF;

	SELECT * FROM musical_entries AS e
	WHERE e.entry_id = NEW.entry_id
	INTO entry_row;

	FOR conflicting_special_artist IN
		SELECT sa.*
		FROM musical_release_special_artists AS sa
		WHERE sa.release_id = NEW.release_id
			AND entry_has_matching_artist_association(
				NEW.entry_id,
				sa.artist_id,
				sa.entry_artist_name_id
			)
	LOOP
		validation_errors := add_formatted_message(
			validation_errors,
			'Cannot change entry_id of release "%s" (version "%s") to entry "%s" (id "%s"): release special artist (artist id "%s", entry_artist_name_id "%s") matches an existing entry-artist association on the new entry. A special artist is only allowed when the artist is not on the entry, or is on the entry under a different alternative name (including null).',
			NEW.release_id::TEXT,
			NEW.release_version,
			entry_row.main_name,
			NEW.entry_id::TEXT,
			conflicting_special_artist.artist_id::TEXT,
			COALESCE(conflicting_special_artist.entry_artist_name_id::TEXT, 'null')
		);
	END LOOP;

	IF cardinality(validation_errors) > 0 THEN
		CALL array_of_errors_to_exception(validation_errors);
	END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER validate_musical_releases_special_artists_on_entry_change
BEFORE UPDATE OF entry_id ON musical_releases
FOR EACH ROW
EXECUTE FUNCTION validate_musical_releases_special_artists_on_entry_change();
