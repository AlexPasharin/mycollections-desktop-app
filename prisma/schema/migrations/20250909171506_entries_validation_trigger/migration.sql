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

-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

CREATE OR REPLACE FUNCTION validate_musical_entry()
RETURNS TRIGGER AS $$
DECLARE
	validation_errors TEXT[];
	validated_release_date TEXT;
	release_date_validation_errors TEXT[];
	trimmed_release_date TEXT;
	main_name_trimmed TEXT;
	alt_name TEXT;
	alt_name_trimmed TEXT;
	alt_names_dict JSONB;
	alt_names_trimmed TEXT[];
BEGIN
	main_name_trimmed := TRIM(NEW.main_name);

	IF NEW.main_name IS DISTINCT FROM TRIM(main_name_trimmed) THEN
      	CALL raise_notice_with_query_id(
            'Automatically trimmed leading/trailing spaces from "main name" of entry "%s". Original: "%s", Corrected: "%s".',
            NEW.name_id,
            NEW.main_name,
            TRIM(main_name_trimmed)
       	);

		NEW.main_name:=  TRIM(main_name_trimmed);
    END IF;

	FOREACH alt_name IN ARRAY COALESCE(NEW.alternative_names, '{}')
	LOOP
		alt_name_trimmed := TRIM(alt_name);

		IF alt_name_trimmed = main_name_trimmed THEN
			validation_errors := add_formatted_message(validation_errors, '"Alternative name" of entry cannot be same as its main name. Entry "%s" with id "%s", all names are trimmed.', main_name_trimmed, NEW.entry_id::TEXT);
			EXIT;
		END IF;

		IF alt_name_trimmed IS DISTINCT FROM alt_name THEN
			CALL raise_notice_with_query_id(
				'Automatically trimmed leading/trailing spaces from "alternative_name" of entry "%s", id "%s". Original: "%s", Corrected: "%s".',
				main_name_trimmed,
				NEW.entry_id::TEXT,
				alt_name,
				alt_name_trimmed
			);
		END IF;

		IF has_key(alt_names_dict, alt_name_trimmed) THEN
			CALL raise_notice_with_query_id('Dublicate "alternative_name" "%s" is skipped', alt_name_trimmed);
		ELSE
			alt_names_dict := set_jsonb_value(alt_names_dict, alt_name_trimmed, 'true');
			alt_names_trimmed := array_append(alt_names_trimmed, alt_name_trimmed);
		END IF;
	END LOOP;

	NEW.alternative_names := alt_names_trimmed;

	IF NEW.original_release_date IS NOT NULL THEN
		trimmed_release_date := TRIM(NEW.original_release_date);

		SELECT validated_date_str, validation_errors AS release_date_validation_errors
		FROM validate_generalised_date(trimmed_release_date)
		INTO validated_release_date, release_date_validation_errors;

		IF cardinality(release_date_validation_errors) > 0 THEN
			validation_errors := validation_errors || release_date_validation_errors;
		ELSIF validated_release_date IS DISTINCT FROM NEW.original_release_date THEN
			CALL raise_notice_with_query_id(
				'Automatically formatted "original_release_date" of entry "%s", id "%s" (trimmed and added leading zeroes to month and day, if necessary). Original: "%s", Corrected: "%s".',
				main_name_trimmed,
				NEW.entry_id,
				NEW.original_release_date,
				trimmed_release_date
	        );

			NEW.original_release_date = validated_release_date;
		END IF;
	END IF;

	--commment!
	--discogs url!
	--relation_to_queen and part of queen_collection!

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER validate_musical_entry
BEFORE INSERT OR UPDATE ON musical_entries
FOR EACH ROW
EXECUTE FUNCTION validate_musical_entry();
