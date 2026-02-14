-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

CREATE OR REPLACE FUNCTION validate_labels_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
		SELECT 1
    FROM musical_releases
    WHERE
      catalogue_numbers @@ format('$.label == %s', to_json(OLD.name))::jsonpath OR
      catalogue_numbers @@ format('$.labels == %s', to_json(OLD.name))::jsonpath
	) THEN
    RAISE EXCEPTION 'Not possible to delete label % since it is referenced in the "musical_releases" table.', OLD.name;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE TRIGGER validate_labels_on_delete
BEFORE DELETE ON labels
FOR EACH ROW
EXECUTE FUNCTION validate_labels_on_delete();
