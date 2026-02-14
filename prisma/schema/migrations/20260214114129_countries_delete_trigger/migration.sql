-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

CREATE OR REPLACE FUNCTION validate_countries_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
		SELECT 1 FROM musical_releases where countries @@ format('$.** == %s', to_json(OLD.code_name))::jsonpath
	) THEN
    RAISE EXCEPTION 'Not possible to delete country % since it is referenced in the "musical_releases" table.', OLD.code_name;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE TRIGGER validate_countries_on_delete
BEFORE DELETE ON countries
FOR EACH ROW
EXECUTE FUNCTION validate_countries_on_delete();
