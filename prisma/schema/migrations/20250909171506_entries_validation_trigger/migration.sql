-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

-- given a string representing a date in a given format returns a corresponding date, if it is a valid date
-- otherwise returns null
CREATE OR REPLACE FUNCTION to_date_if_valid(date_str TEXT, format_str TEXT = 'YYYY-MM-DD')
RETURNS DATE AS $$
BEGIN
  RETURN to_date(date_str, format_str);
EXCEPTION WHEN OTHERS THEN
  RETURN null;
END;
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

-- validates a string represents a valid date in format 'YYYY-(M?)M-(D?)D', with leading zeroes in month and day permitted to be omitted
-- if string represents a valid date, returns same date in a strict format 'YYYY-MM-DD' with month and day left-padded with zero, if necessary
-- if string does not represent a valid date, return an array of validation validation_errors
CREATE OR REPLACE FUNCTION validate_generalised_date(
	text TEXT,
	allow_future_dates BOOLEAN = FALSE,
	OUT validated_date_str TEXT,
	OUT validation_errors TEXT[]
) AS $$
DECLARE
	split_text TEXT[];
	year TEXT;
	month TEXT;
	day TEXT;
	represented_date DATE;
BEGIN
	split_text := string_to_array(text, '-');

	IF length(text) = 0 OR array_length(split_text, 1) > 3 THEN
		validation_errors := add_formatted_message(validation_errors, 'Value "%s" is invalid: needs to be in format YYYY-M(M)-D(D) where M and D parts are optional', text);

		RETURN;
	END IF;

	year := split_text[1];
	month := split_text[2];
	day := split_text[3];

	IF NOT year ~ '^(19|20)\d\d$' THEN
		validation_errors := add_formatted_message(validation_errors, 'Value "%s" for year is not valid, should be a number in range 1900-2099.', year);
	END IF;

	IF NOT month ~ '^((0?[1-9])|(1[0-2]))$' THEN
		validation_errors := add_formatted_message(validation_errors, 'Value "%s" for month is not valid, should be a number in range 1-12, with leading zero permissible for values 1-9.', month);
	END IF;

	IF NOT day ~ '^((0?[1-9])|((1|2)[0-9])|(3[0-1]))$' THEN
		validation_errors := add_formatted_message(validation_errors, 'Value "%s" for day is not valid, should be a number in range 1-31, with leading zero permissible for values 1-9.', day);
	END IF;

	IF validation_errors IS NOT NULL THEN
		RETURN;
	END IF;

	month := lpad(month, 2, '0');
	day := lpad(day, 2, '0');

	validated_date_str := array_to_string(ARRAY[year, month, day], '-');
	represented_date := to_date_if_valid(validated_date_str);

	IF represented_date IS NULL THEN
		validation_errors := add_formatted_message(validation_errors, 'Value "%s" does not represent a valid existing date.', validated_date_str);
	ELSIF NOT allow_future_dates AND represented_date > CURRENT_DATE THEN
		validation_errors := add_formatted_message(validation_errors, 'Value "%s" represents a date in the future.', validated_date_str);
	END IF;

	RAISE NOTICE '%', represented_date;

	IF validation_errors IS NOT NULL THEN
		validated_date_str := NULL;
	END IF;
END;
$$ LANGUAGE plpgsql;

