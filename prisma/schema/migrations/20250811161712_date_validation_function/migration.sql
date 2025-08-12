-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

-- as build-in to_date, but return NULL on invalid date, instead of throwing exceptions
CREATE OR REPLACE FUNCTION safe_to_date(str TEXT, format TEXT)
RETURNS DATE AS $$
BEGIN
	 RETURN to_date(str, format);
EXCEPTION
	WHEN others THEN
		RETURN NULL;
END
$$ LANGUAGE plpgsql;

-- adds formatted message to given list of messages, replacing all line break chars with empty char
CREATE OR REPLACE FUNCTION add_formatted_message(messages TEXT[], new_message TEXT, VARIADIC format_args TEXT[])
RETURNS TEXT[] AS $$
DECLARE
	formatted_message TEXT;
BEGIN
	EXECUTE 'SELECT format($1, VARIADIC $2)'
	INTO formatted_message
	USING new_message, format_args;

	RETURN array_append(messages, replace(formatted_message, CHR(10), ' '));
END
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_generalised_date(
	str TEXT,
	OUT validated_str TEXT,
	OUT errors TEXT[]
)
AS $$
DECLARE
	split_text TEXT[];
	year_txt TEXT;
	month_txt TEXT;
	day_txt TEXT;
BEGIN
	split_text := string_to_array(str, '-');

	IF array_length(split_text, 1) > 3 THEN
		errors := add_formatted_message(errors, 'Value "%s" is invalid: needs to be in format YYYY-M(M)-D(D) where M and D parts are optional', str);

		RETURN;
	END IF;

	year_txt := split_text[1];
	month_txt :=split_text[2];
	day_txt := split_text[3];

	IF NOT regexp_like(year_txt, '^(19|20)\d\d$') THEN
		errors := add_formatted_message(errors,'Value "%s" for year in "%s" is invalid: Needs to be year in range 1900-2099', year_txt, str);
	END IF;

	IF month_txt IS NOT NULL AND NOT regexp_like(month_txt, '^((0?[1-9])|(1[0-2]))$') THEN
		errors := add_formatted_message(errors, 'Value "%s" for month in "%s" is invalid: Needs to number in range 1-12, leading zero for values 1 to 9 is permitted', month_txt, str);
	END IF;

	DECLARE
		date_val DATE;
		format TEXT;
	BEGIN
		IF array_length(errors, 1) IS NULL THEN
			date_val := safe_to_date(str, 'YYYY-MM-DD');

			IF date_val IS NULL THEN
				errors := add_formatted_message(errors, 'Value "%s" represents invalid date', str);
			ELSE
				IF month_txt IS NULL THEN
					format := 'YYYY';
				ELSIF day_txt IS NULL THEN
					format := 'YYYY-MM';
				ELSE
					format := 'YYYY-MM-DD';
				END IF;

				validated_str := to_char(date_val, format);
			END IF;
		END IF;
	END;
END;
$$ LANGUAGE plpgsql;

