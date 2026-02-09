-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

CREATE OR REPLACE FUNCTION validate_tags()
RETURNS TRIGGER AS $$
DECLARE
	tag_trimmed TEXT;
BEGIN
	tag_trimmed := TRIM(NEW.tag);

  IF NEW.tag IS DISTINCT FROM tag_trimmed THEN
    CALL raise_notice_with_query_id(
      'Automatically trimmed leading/trailing spaces from "tag" field of tag. Original: "%s", Corrected: "%s".',
      NEW.tag,
      tag_trimmed
    );

    NEW.tag := tag_trimmed;
  END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER validate_tags
BEFORE INSERT OR UPDATE ON tags
FOR EACH ROW
EXECUTE FUNCTION validate_tags();
