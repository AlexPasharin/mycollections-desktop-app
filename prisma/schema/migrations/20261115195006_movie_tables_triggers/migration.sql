-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema


CREATE OR REPLACE FUNCTION validate_movie()
RETURNS TRIGGER AS $$
DECLARE
	validation_errors TEXT[];
	validated_release_date TEXT;
	release_date_validation_errors TEXT[];
	trimmed_release_date TEXT;
	name_trimmed TEXT;
	comment_trimmed TEXT;
	imdb_url_trimmed TEXT;
	relation_to_queen_trimmed TEXT;
	release_relation RECORD;
BEGIN
	name_trimmed := TRIM(NEW.name);

	IF NEW.name IS DISTINCT FROM name_trimmed THEN
		CALL raise_notice_with_query_id(
			'Automatically trimmed leading/trailing spaces from "name" of movie "%s". Original: "%s", Corrected: "%s".',
			NEW.movie_id::TEXT,
			NEW.name,
			name_trimmed
		);

		NEW.name := name_trimmed;
	END IF;

	IF NEW.original_release_date IS NOT NULL THEN
		trimmed_release_date := TRIM(NEW.original_release_date);

		SELECT release_date_validation_results.validated_date_str, release_date_validation_results.validation_errors
		FROM validate_generalised_date(trimmed_release_date) AS release_date_validation_results
		INTO validated_release_date, release_date_validation_errors;

		IF cardinality(release_date_validation_errors) > 0 THEN
			validation_errors := validation_errors || release_date_validation_errors;
		ELSIF validated_release_date IS DISTINCT FROM NEW.original_release_date THEN
			CALL raise_notice_with_query_id(
				'Automatically formatted "original_release_date" of movie "%s", id "%s" (trimmed and added leading zeroes to month and day, if necessary). Original: "%s", Corrected: "%s".',
				name_trimmed,
				NEW.movie_id::TEXT,
				NEW.original_release_date,
				validated_release_date
			);

			NEW.original_release_date := validated_release_date;
		END IF;
	END IF;

	comment_trimmed := TRIM(NEW.comment);

	IF NEW.comment IS DISTINCT FROM comment_trimmed THEN
		CALL raise_notice_with_query_id(
			'Automatically trimmed leading/trailing spaces from "comment" of movie "%s", id "%s". Original: "%s", Corrected: "%s".',
			name_trimmed,
			NEW.movie_id::TEXT,
			NEW.comment,
			comment_trimmed
		);

		NEW.comment := comment_trimmed;
	END IF;

	imdb_url_trimmed := TRIM(NEW.imdb_url);

	IF imdb_url_trimmed IS NOT NULL AND NOT imdb_url_trimmed ~ '^https://www.imdb.com/title/tt\d+$' THEN
		validation_errors := add_formatted_message(
			validation_errors,
			'(Trimmed) value "%s" for "imdb_url" of movie "%s", id "%s", is not valid - must be of form "https://www.imdb.com/title/tt(some numbers)..."',
			imdb_url_trimmed,
			name_trimmed,
			NEW.movie_id::TEXT
		);
	ELSIF imdb_url_trimmed IS DISTINCT FROM NEW.imdb_url THEN
		CALL raise_notice_with_query_id(
			'Automatically trimmed leading/trailing spaces from "imdb_url" of movie "%s", id "%s". Original: "%s", Corrected: "%s".',
			name_trimmed,
			NEW.movie_id::TEXT,
			NEW.imdb_url,
			imdb_url_trimmed
		);

		NEW.imdb_url := imdb_url_trimmed;
	END IF;

	relation_to_queen_trimmed := TRIM(NEW.relation_to_queen);

	IF NOT NEW.part_of_queen_collection AND relation_to_queen_trimmed IS NOT NULL THEN
		validation_errors := add_formatted_message(
			validation_errors,
			'Value for "relation_to_queen" cannot be given if "part_of_queen_collection" is false! Movie "%s" with id "%s".',
			name_trimmed,
			NEW.movie_id::TEXT
		);
	ELSIF relation_to_queen_trimmed IS DISTINCT FROM NEW.relation_to_queen THEN
		CALL raise_notice_with_query_id(
			'Automatically trimmed leading/trailing spaces from "relation_to_queen" of movie "%s", id "%s". Original: "%s", Corrected: "%s".',
			name_trimmed,
			NEW.movie_id::TEXT,
			NEW.relation_to_queen,
			relation_to_queen_trimmed
		);

		NEW.relation_to_queen := relation_to_queen_trimmed;
	END IF;

	FOR release_relation IN
		SELECT r.movie_release_id, r.release_version, r.release_date, r.part_of_queen_collection
		FROM movie_release_movies AS m
		JOIN movie_releases AS r
		ON m.movie_release_id = r.movie_release_id
		WHERE m.movie_id = NEW.movie_id
		LOOP
			IF release_relation.release_date IS NOT NULL AND generalised_date_to_date(release_relation.release_date, TRUE) < generalised_date_to_date(NEW.original_release_date, FALSE) THEN
				validation_errors := add_formatted_message(
					validation_errors,
					'Release date ("%s") of release "%s" (version "%s", movie "%s", id "%s") cannot be before it''s movie''s original release date ("%s").',
					release_relation.release_date,
					release_relation.movie_release_id::TEXT,
					release_relation.release_version,
					name_trimmed,
					NEW.movie_id::TEXT,
					NEW.original_release_date
				);
			END IF;

			IF NOT release_relation.part_of_queen_collection AND NEW.part_of_queen_collection THEN
				validation_errors := add_formatted_message(
					validation_errors,
					'Movie "%s" (id "%s") is a part of Queen collection, but has a release "%s" (version "%s") which is not marked as part of Queen collection.',
					name_trimmed,
					NEW.movie_id::TEXT,
					release_relation.movie_release_id::TEXT,
					release_relation.release_version
				);
			END IF;
		END LOOP;

	IF cardinality(validation_errors) > 0 THEN
		CALL array_of_errors_to_exception(validation_errors);
	END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER validate_movies
BEFORE INSERT OR UPDATE ON movies
FOR EACH ROW
EXECUTE FUNCTION validate_movie();


CREATE OR REPLACE FUNCTION validate_movie_releases()
RETURNS TRIGGER AS $$
DECLARE
	movie RECORD;
	validation_errors TEXT[];
	name_trimmed TEXT;
	trimmed_release_version TEXT;
	validated_release_date TEXT;
	release_date_validation_errors TEXT[];
	trimmed_release_date TEXT;
	comment_trimmed TEXT;
	condition_problems_trimmed TEXT;
	relation_to_queen_trimmed TEXT;
BEGIN
	name_trimmed := TRIM(NEW.name);

	IF NEW.name IS DISTINCT FROM name_trimmed THEN
		CALL raise_notice_with_query_id(
			'Automatically trimmed leading/trailing spaces from "name" of movie release "%s". Original: "%s", Corrected: "%s".',
			NEW.movie_release_id::TEXT,
			NEW.name,
			name_trimmed
		);

		NEW.name := name_trimmed;
	END IF;

	trimmed_release_version := TRIM(NEW.release_version);

	IF trimmed_release_version IS DISTINCT FROM NEW.release_version THEN
		CALL raise_notice_with_query_id(
			'Automatically trimmed leading/trailing spaces from "version" of movie release "%s" (name "%s"). Original: "%s", Corrected: "%s".',
			NEW.movie_release_id::TEXT,
			name_trimmed,
			NEW.release_version,
			trimmed_release_version
		);

		NEW.release_version := trimmed_release_version;
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
			IF validated_release_date IS DISTINCT FROM NEW.release_date THEN
				CALL raise_notice_with_query_id(
					'Automatically formatted "release_date" of movie release "%s" (version "%s") (trimmed and added leading zeroes to month and day, if necessary). Original: "%s", Corrected: "%s".',
					NEW.movie_release_id::TEXT,
					NEW.release_version,
					NEW.release_date,
					validated_release_date
				);

        NEW.release_date := validated_release_date;
			END IF;

		END IF;
	END IF;

	comment_trimmed := TRIM(NEW.comment);

	IF NEW.comment IS DISTINCT FROM comment_trimmed THEN
		CALL raise_notice_with_query_id(
			'Automatically trimmed leading/trailing spaces from "comment" of movie release "%s" (version "%s"). Original: "%s", Corrected: "%s".',
			NEW.movie_release_id::TEXT,
			NEW.release_version,
			NEW.comment,
			comment_trimmed
		);

		NEW.comment := comment_trimmed;
	END IF;

	condition_problems_trimmed := TRIM(NEW.condition_problems);

	IF NEW.condition_problems IS DISTINCT FROM condition_problems_trimmed THEN
		CALL raise_notice_with_query_id(
			'Automatically trimmed leading/trailing spaces from "condition_problems" of movie release "%s" (version "%s"). Original: "%s", Corrected: "%s".',
			NEW.movie_release_id::TEXT,
			NEW.release_version,
			NEW.condition_problems,
			condition_problems_trimmed
		);

		NEW.condition_problems := condition_problems_trimmed;
	END IF;

	relation_to_queen_trimmed := TRIM(NEW.relation_to_queen);

	IF NOT NEW.part_of_queen_collection AND relation_to_queen_trimmed IS NOT NULL THEN
		validation_errors := add_formatted_message(
			validation_errors,
			'Value for "relation_to_queen" cannot be given if "part_of_queen_collection" is false! Movie release "%s" (version "%s").',
			NEW.movie_release_id::TEXT,
			NEW.release_version
		);
	ELSIF NEW.relation_to_queen IS DISTINCT FROM relation_to_queen_trimmed THEN
		CALL raise_notice_with_query_id(
			'Automatically trimmed leading/trailing spaces from "relation_to_queen" of movie release "%s" (version "%s"). Original: "%s", Corrected: "%s".',
			NEW.movie_release_id::TEXT,
			NEW.release_version,
			NEW.relation_to_queen,
			relation_to_queen_trimmed
		);

		NEW.relation_to_queen := relation_to_queen_trimmed;
	END IF;

	-- on insert there are no linked movies yet, so this only matters for updates
	FOR movie IN
		SELECT m.movie_id, m.name, m.original_release_date, m.part_of_queen_collection
		FROM movie_release_movies AS rm
		JOIN movies AS m
		ON rm.movie_id = m.movie_id
		WHERE rm.movie_release_id = NEW.movie_release_id
		LOOP
			IF validated_release_date IS NOT NULL AND generalised_date_to_date(validated_release_date, TRUE) < generalised_date_to_date(movie.original_release_date, FALSE) THEN
				validation_errors := add_formatted_message(
					validation_errors,
					'Release date ("%s") of movie release "%s" (version "%s") cannot be before original release date ("%s") of it''s movie "%s" (id "%s").',
					validated_release_date,
					NEW.movie_release_id::TEXT,
					NEW.release_version,
					movie.original_release_date,
					movie.name,
					movie.movie_id::TEXT
				);
			END IF;

			IF movie.part_of_queen_collection AND NOT NEW.part_of_queen_collection THEN
				validation_errors := add_formatted_message(
					validation_errors,
					'Movie "%s" (id "%s") of movie release "%s" (version "%s") is a part of Queen collection, but release is not marked as part of Queen collection.',
					movie.name,
					movie.movie_id::TEXT,
					NEW.movie_release_id::TEXT,
					NEW.release_version
				);
			END IF;
		END LOOP;

	SELECT * FROM validate_release_countries_jsonb(
		NEW.countries,
		format(
			'Movie release %s (version "%s"), "countries" column: ',
			NEW.movie_release_id,
			NEW.release_version
		),
		TRUE,
		validation_errors
	)
	INTO validation_errors, NEW.countries;

	SELECT * FROM validate_release_cat_numbers_jsonb(
		NEW.catalogue_numbers,
		format(
			'Movie release %s (version "%s"), "catalogue_numbers" column: ',
			NEW.movie_release_id,
			NEW.release_version
		),
		TRUE,
		validation_errors
	)
	INTO validation_errors, NEW.catalogue_numbers;

	SELECT * FROM validate_release_matrix_runout_jsonb(
		NEW.matrix_runout,
		format(
			'Movie release %s (version "%s"), "matrix_runout" column: ',
			NEW.movie_release_id,
			NEW.release_version
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

CREATE OR REPLACE TRIGGER validate_movie_releases
BEFORE INSERT OR UPDATE ON movie_releases
FOR EACH ROW
EXECUTE FUNCTION validate_movie_releases();


CREATE OR REPLACE FUNCTION validate_movie_release_movies()
RETURNS TRIGGER AS $$
DECLARE
	movie RECORD;
	release RECORD;
	validation_errors TEXT[];
BEGIN
	SELECT m.movie_id, m.name, m.original_release_date, m.part_of_queen_collection
	FROM movies AS m
	WHERE m.movie_id = NEW.movie_id
	INTO movie;

	SELECT r.movie_release_id, r.release_version, r.release_date, r.part_of_queen_collection
	FROM movie_releases AS r
	WHERE r.movie_release_id = NEW.movie_release_id
	INTO release;

	IF release.release_date IS NOT NULL
		AND movie.original_release_date IS NOT NULL
		AND generalised_date_to_date(release.release_date, TRUE) < generalised_date_to_date(movie.original_release_date, FALSE) THEN
		validation_errors := add_formatted_message(
			validation_errors,
			'Release date ("%s") of movie release "%s" (version "%s") cannot be before original release date ("%s") of it''s movie "%s" (id "%s").',
			release.release_date,
			release.movie_release_id::TEXT,
			release.release_version,
			movie.original_release_date,
			movie.name,
			movie.movie_id::TEXT
		);
	END IF;

	IF movie.part_of_queen_collection AND NOT release.part_of_queen_collection THEN
		validation_errors := add_formatted_message(
			validation_errors,
			'Movie "%s" (id "%s") of movie release "%s" (version "%s") is a part of Queen collection, but release is not marked as part of Queen collection.',
			movie.name,
			movie.movie_id::TEXT,
			release.movie_release_id::TEXT,
			release.release_version
		);
	END IF;

	IF cardinality(validation_errors) > 0 THEN
		CALL array_of_errors_to_exception(validation_errors);
	END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER validate_movie_release_movies
BEFORE INSERT OR UPDATE ON movie_release_movies
FOR EACH ROW
EXECUTE FUNCTION validate_movie_release_movies();


ALTER TABLE formats_of_movie_releases
DROP CONSTRAINT IF EXISTS formats_of_movie_releases_amount_positive,
ADD CONSTRAINT formats_of_movie_releases_amount_positive CHECK (amount > 0);


-- child release order numbers must form a sequence 1..n for each parent movie release. Children of both kinds
-- (movie releases from parent_movie_releases and musical releases from parent_movie_musical_release_relations)
-- share one sequence, so order numbers of both tables are considered together
-- (check_sequential_integers is defined in 20260821182000_parent_child_relation_order_number_triggers)
-- trigger arguments: name of the column holding parent release id in the table the trigger is declared on

CREATE OR REPLACE FUNCTION validate_movie_release_child_order()
RETURNS TRIGGER AS $$
DECLARE
	parent_column TEXT := TG_ARGV[0];
	parent_release_ids UUID[];
	checked_parent_release_id UUID;
	order_numbers INTEGER[];
	validation_errors TEXT[];
BEGIN
	IF TG_OP = 'INSERT' THEN
		parent_release_ids := ARRAY[(to_jsonb(NEW) ->> parent_column)::UUID];
	ELSIF TG_OP = 'DELETE' THEN
		parent_release_ids := ARRAY[(to_jsonb(OLD) ->> parent_column)::UUID];
	ELSE
		parent_release_ids := ARRAY[(to_jsonb(NEW) ->> parent_column)::UUID];

		IF to_jsonb(OLD) ->> parent_column IS DISTINCT FROM to_jsonb(NEW) ->> parent_column THEN
			parent_release_ids := parent_release_ids || (to_jsonb(OLD) ->> parent_column)::UUID;
		END IF;
	END IF;

	FOREACH checked_parent_release_id IN ARRAY parent_release_ids
	LOOP
		SELECT ARRAY_AGG(child_release_order_number)
		INTO order_numbers
		FROM (
			SELECT child_release_order_number
			FROM parent_movie_releases
			WHERE parent_release_id = checked_parent_release_id
			UNION ALL
			SELECT child_release_order_number
			FROM parent_movie_musical_release_relations
			WHERE parent_movie_release_id = checked_parent_release_id
		) AS children;

		IF NOT check_sequential_integers(order_numbers) THEN
			validation_errors := add_formatted_message(
				validation_errors,
				'Child release order numbers (of movie releases and musical releases together) of parent movie release "%s" must form a sequence of integers starting from 1 without gaps or duplicates. Resulting order numbers: %s.',
				checked_parent_release_id::TEXT,
				array_to_string(order_numbers, ', ')
			);
		END IF;
	END LOOP;

	IF cardinality(validation_errors) > 0 THEN
		CALL array_of_errors_to_exception(validation_errors);
	END IF;

	RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- the check is deferred to the end of the transaction, because related releases are synced by deleting all
-- relations of a release and re-inserting them, which passes through intermediate states with gaps

DROP TRIGGER IF EXISTS validate_parent_movie_release_child_order ON parent_movie_releases;
CREATE CONSTRAINT TRIGGER validate_parent_movie_release_child_order
AFTER INSERT OR UPDATE OR DELETE ON parent_movie_releases
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION validate_movie_release_child_order('parent_release_id');

DROP TRIGGER IF EXISTS validate_parent_movie_musical_release_child_order ON parent_movie_musical_release_relations;
CREATE CONSTRAINT TRIGGER validate_parent_movie_musical_release_child_order
AFTER INSERT OR UPDATE OR DELETE ON parent_movie_musical_release_relations
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION validate_movie_release_child_order('parent_movie_release_id');


-- if child release is a part of Queen collection, its parent release must be too
-- trigger arguments: name of the column holding parent movie release id, name of the column holding child release id,
-- name of the table of child releases, name of the primary key column of child releases table, description of child releases

CREATE OR REPLACE FUNCTION validate_parent_movie_release_queen_collection()
RETURNS TRIGGER AS $$
DECLARE
	parent_column TEXT := TG_ARGV[0];
	child_column TEXT := TG_ARGV[1];
	child_table TEXT := TG_ARGV[2];
	child_id_column TEXT := TG_ARGV[3];
	child_description TEXT := TG_ARGV[4];
	parent_release RECORD;
	child_release RECORD;
	validation_errors TEXT[];
BEGIN
	SELECT r.movie_release_id, r.release_version, r.part_of_queen_collection
	FROM movie_releases AS r
	WHERE r.movie_release_id = (to_jsonb(NEW) ->> parent_column)::UUID
	INTO parent_release;

	EXECUTE format(
		'SELECT %I AS release_id, release_version, part_of_queen_collection FROM %I WHERE %I = $1',
		child_id_column,
		child_table,
		child_id_column
	)
	INTO child_release
	USING (to_jsonb(NEW) ->> child_column)::UUID;

	IF child_release.part_of_queen_collection AND NOT parent_release.part_of_queen_collection THEN
		validation_errors := add_formatted_message(
			validation_errors,
			'Child %s "%s" (version "%s") is a part of Queen collection, but its parent movie release "%s" (version "%s") is not.',
			child_description,
			child_release.release_id::TEXT,
			child_release.release_version,
			parent_release.movie_release_id::TEXT,
			parent_release.release_version
		);
	END IF;

	IF cardinality(validation_errors) > 0 THEN
		CALL array_of_errors_to_exception(validation_errors);
	END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER validate_parent_movie_release_queen_collection
BEFORE INSERT OR UPDATE ON parent_movie_releases
FOR EACH ROW
EXECUTE FUNCTION validate_parent_movie_release_queen_collection(
	'parent_release_id', 'child_release_id', 'movie_releases', 'movie_release_id', 'movie release'
);

CREATE OR REPLACE TRIGGER validate_parent_movie_musical_release_queen_collection
BEFORE INSERT OR UPDATE ON parent_movie_musical_release_relations
FOR EACH ROW
EXECUTE FUNCTION validate_parent_movie_release_queen_collection(
	'parent_movie_release_id', 'child_musical_release_id', 'musical_releases', 'release_id', 'musical release'
);
