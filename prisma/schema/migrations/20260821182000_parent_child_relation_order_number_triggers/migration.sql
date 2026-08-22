-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

-- returns TRUE when the given numbers form the sequence 1..n, in any order, without gaps or duplicates
CREATE OR REPLACE FUNCTION check_sequential_integers(
	numbers INTEGER[]
) RETURNS BOOLEAN
AS $$
DECLARE
	is_sequential BOOLEAN;
BEGIN
	IF numbers IS NULL OR cardinality(numbers) = 0 THEN
		RETURN TRUE;
	END IF;

	SELECT MIN(n) = 1 AND MAX(n) = COUNT(*) AND COUNT(DISTINCT n) = COUNT(*)
	FROM unnest(numbers) AS n INTO is_sequential;

	RETURN is_sequential;
END
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_parent_musical_entry_child_order()
RETURNS TRIGGER AS $$
DECLARE
	parent_entry_ids UUID[];
	checked_parent_entry_id UUID;
	order_numbers INTEGER[];
	validation_errors TEXT[];
BEGIN
	IF TG_OP = 'INSERT' THEN
		parent_entry_ids := ARRAY[NEW.parent_entry_id];
	ELSIF TG_OP = 'DELETE' THEN
		parent_entry_ids := ARRAY[OLD.parent_entry_id];
	ELSE
		parent_entry_ids := ARRAY[NEW.parent_entry_id];

		IF OLD.parent_entry_id IS DISTINCT FROM NEW.parent_entry_id THEN
			parent_entry_ids := parent_entry_ids || OLD.parent_entry_id;
		END IF;
	END IF;

	FOREACH checked_parent_entry_id IN ARRAY parent_entry_ids
	LOOP
		SELECT ARRAY_AGG(child_entry_order_number)
		INTO order_numbers
		FROM parent_musical_entries
		WHERE parent_entry_id = checked_parent_entry_id;

		IF NOT check_sequential_integers(order_numbers) THEN
			validation_errors := add_formatted_message(
				validation_errors,
				'Child entry order numbers of parent entry "%s" must form a sequence of integers starting from 1 without gaps or duplicates. Resulting order numbers: %s.',
				checked_parent_entry_id::TEXT,
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

-- the check is deferred to the end of the transaction, because related entries are synced by deleting all
-- relations of an entry and re-inserting them, which passes through intermediate states with gaps

CREATE CONSTRAINT TRIGGER validate_parent_musical_entry_child_order
AFTER INSERT OR UPDATE OR DELETE ON parent_musical_entries
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION validate_parent_musical_entry_child_order();

CREATE OR REPLACE FUNCTION validate_parent_musical_release_child_order()
RETURNS TRIGGER AS $$
DECLARE
	parent_release_ids UUID[];
	checked_parent_release_id UUID;
	order_numbers INTEGER[];
	validation_errors TEXT[];
BEGIN
	IF TG_OP = 'INSERT' THEN
		parent_release_ids := ARRAY[NEW.parent_release_id];
	ELSIF TG_OP = 'DELETE' THEN
		parent_release_ids := ARRAY[OLD.parent_release_id];
	ELSE
		parent_release_ids := ARRAY[NEW.parent_release_id];

		IF OLD.parent_release_id IS DISTINCT FROM NEW.parent_release_id THEN
			parent_release_ids := parent_release_ids || OLD.parent_release_id;
		END IF;
	END IF;

	FOREACH checked_parent_release_id IN ARRAY parent_release_ids
	LOOP
		SELECT ARRAY_AGG(child_release_order_number)
		INTO order_numbers
		FROM parent_musical_releases
		WHERE parent_release_id = checked_parent_release_id;

		IF NOT check_sequential_integers(order_numbers) THEN
			validation_errors := add_formatted_message(
				validation_errors,
				'Child release order numbers of parent release "%s" must form a sequence of integers starting from 1 without gaps or duplicates. Resulting order numbers: %s.',
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

CREATE CONSTRAINT TRIGGER validate_parent_musical_release_child_order
AFTER INSERT OR UPDATE OR DELETE ON parent_musical_releases
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION validate_parent_musical_release_child_order();
