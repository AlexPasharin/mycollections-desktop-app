-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

CREATE OR REPLACE FUNCTION validate_country_json_as_string(
	country JSONB,
	messages_prefix TEXT,
	INOUT countries_dict JSONB,
	INOUT countries_to_validate TEXT[],
	INOUT validation_errors TEXT[]
) AS $$
DECLARE
	country_text_value TEXT;
	trimmed_country_text_value TEXT;
	lowercased_trimmed_country_text_value TEXT;
BEGIN
	IF jsonb_typeof(country) != 'string' THEN
		validation_errors = add_formatted_message(
			validation_errors,
			'%sInvalid value "%s"- must be a string.',
			messages_prefix,
			country::text
		);

		RETURN;
	END IF;

	country_text_value = JSON_VALUE(country, '$' RETURNING text);
	trimmed_country_text_value = trim(country_text_value);
	lowercased_trimmed_country_text_value = lower(trimmed_country_text_value);

	IF has_key(countries_dict, lowercased_trimmed_country_text_value) THEN
		CALL raise_notice_with_query_id(
			'%sDuplicate country "%s" is skipped (note that in this context countries are considered to be case-insensitive).',
			messages_prefix,
			trimmed_country_text_value
		);
	ELSE
		countries_dict = set_jsonb_value(countries_dict, lowercased_trimmed_country_text_value, 'true');
		countries_to_validate = countries_to_validate || lowercased_trimmed_country_text_value;

		IF trimmed_country_text_value IS DISTINCT FROM country_text_value THEN
			CALL raise_notice_with_query_id(
				'%sAutomatically trimmed value for country, original: "%s", corrected: "%s".',
				messages_prefix,
				country_text_value,
				trimmed_country_text_value
			);
		END IF;
	END IF;
END
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_countries_value_as_string_or_array(
	countries_json_value JSONB,
	messages_prefix TEXT,
	INOUT validation_errors TEXT[],
	OUT validated_value JSONB
) AS $$
DECLARE
	original_countries_type TEXT = jsonb_typeof(countries_json_value);
	country JSONB;
	countries_to_validate TEXT[];
	countries_dict JSONB = '{}';
	country_validation_result RECORD;
BEGIN
	-- This case can be reduced to case where "countries" is an array
	IF jsonb_typeof(countries_json_value) = 'string' THEN
		countries_json_value = json_build_array(JSON_VALUE(countries_json_value, '$' RETURNING text));
	END IF;

	IF jsonb_typeof(countries_json_value) != 'array' THEN
		RETURN;
	END IF;

	IF jsonb_array_length(countries_json_value) = 0 THEN
		validation_errors = add_formatted_message(
			validation_errors,
			'%sEmpty array is not allowed.',
			messages_prefix
		);

		RETURN;
	END IF;

	FOR country IN SELECT value FROM jsonb_array_elements(countries_json_value)
	LOOP
		SELECT * FROM validate_country_json_as_string(country, messages_prefix, countries_dict, countries_to_validate, validation_errors)
		INTO countries_dict, countries_to_validate, validation_errors;
	END LOOP;

	validated_value = '[]'::jsonb;

	FOR country_validation_result IN
		SELECT
			arr.country_val,
			c.code_name
		FROM
			unnest(countries_to_validate) WITH ORDINALITY AS arr(country_val, idx)
		LEFT JOIN
			countries AS c ON arr.country_val = lower(c.code_name)
		ORDER BY
			arr.idx
	LOOP
		IF country_validation_result.code_name IS NULL THEN
			validation_errors = add_formatted_message(
				validation_errors,
				'%sValue "%s" (case-insensitive) does not correspond to any country''s code name in "countries" table.',
				messages_prefix,
				country_validation_result.country_val
			);
		ELSE
			validated_value = validated_value || to_jsonb(country_validation_result.code_name);
		END IF;
	END LOOP;

	IF jsonb_array_length(countries_json_value) = 1 THEN
		validated_value = validated_value -> 0;

		IF original_countries_type = 'array' THEN
			CALL raise_notice_with_query_id(
				'%sValue was given as an array, but this array contained only one value, so was reduced to it''s single value "%s".',
				messages_prefix,
				countries_to_validate[1]
			);
		END IF;
	END IF;

END
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_countries_slipcase_property(
	slipcase_jsonb_value JSONB,
	messages_prefix TEXT,
	INOUT validation_errors TEXT[],
	OUT validated_value JSONB
) AS $$
DECLARE
	keys TEXT[];
	printed_in_value JSONB;
	printed_in_validated_value JSONB;
BEGIN
	IF jsonb_typeof(slipcase_jsonb_value) != 'object' THEN
		validation_errors = add_formatted_message(
			validation_errors,
			'%sValue "%s" is invalid - must be jsonb object with "printed in" property (and only that property).',
			messages_prefix,
			slipcase_jsonb_value::text
		);

		RETURN;
	END IF;

	SELECT array_agg(key)
	INTO keys
	FROM (SELECT key FROM jsonb_object_keys(slipcase_jsonb_value) AS key LIMIT 2);

	IF keys != '{"printed in"}'::text[] THEN
		validation_errors = add_formatted_message(
			validation_errors,
			'%sValue "%s" is invalid - must be jsonb object with "printed in" property (and only that property).',
			messages_prefix,
			slipcase_jsonb_value::text
		);

		RETURN;
	END IF;

	printed_in_value = jsonb_extract_path(slipcase_jsonb_value, 'printed in');

	SELECT * FROM validate_countries_value_as_string_or_array(
			printed_in_value,
			format('%s, "printed_in" property: ', messages_prefix),
			validation_errors
		)
	INTO validation_errors, printed_in_validated_value;

	IF printed_in_validated_value IS NULL THEN
		validation_errors = add_formatted_message(
			validation_errors,
			'%sValue''s "%s" "printed in" property should be string or array of strings',
			messages_prefix,
			countries::text
		);
	ELSE
		validated_value = jsonb_build_object('printed in', printed_in_validated_value);
	END IF;
END
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_release_countries_jsonb(
	countries JSONB,
	messages_prefix TEXT = '',
	allow_cd_slipcase_shape BOOLEAN = TRUE,
	INOUT validation_errors TEXT[] = NULL,
	OUT validated_value JSONB
) AS $$
DECLARE
	country JSONB;
	keys TEXT[];
	made_in_value JSONB;
	printed_in_value JSONB;
	made_in_validated_value JSONB;
	printed_in_validated_value JSONB;
	cd_value JSONB;
	slipcase_value JSONB;
	cd_validated_value JSONB;
	slipcase_validated_value JSONB;
BEGIN
	IF jsonb_typeof(countries) = 'null' THEN
		countries = NULL;

		CALL raise_notice_with_query_id(
			'%sJson "null" value was reduced to DB NULL.',
			messages_prefix
		);
	END IF;

	IF countries IS NULL THEN
		RETURN;
	END IF;

	SELECT * FROM validate_countries_value_as_string_or_array(countries, messages_prefix, validation_errors)
	INTO validation_errors, validated_value;

	IF validated_value IS NOT NULL THEN
		RETURN;
	END IF;

	IF jsonb_typeof(countries) != 'object' THEN
		validation_errors = add_formatted_message(
			validation_errors,
			'%sInvalid value "%s" - must be of type string, array, an object or null (jsonb null or DB null).',
			messages_prefix,
			countries::text
		);

		RETURN;
	END IF;

	SELECT array_agg(key)
	INTO keys
	FROM (SELECT key FROM jsonb_object_keys(countries) AS key ORDER BY lower(key) LIMIT 3);

	IF keys = '{"made in", "printed in"}'::text[] THEN
		made_in_value = jsonb_extract_path(countries, 'made in');
		printed_in_value = jsonb_extract_path(countries, 'printed in');

		SELECT * FROM validate_countries_value_as_string_or_array(
			made_in_value,
			format('%s"made in" property: ', messages_prefix),
			validation_errors
		)
		INTO validation_errors, made_in_validated_value;

		SELECT * FROM validate_countries_value_as_string_or_array(
			printed_in_value,
			format('%s"printed_in" property: ', messages_prefix),
			validation_errors
		)
		INTO validation_errors, printed_in_validated_value;

		IF made_in_validated_value IS NULL THEN
			validation_errors = add_formatted_message(
				validation_errors,
				'%sValue''s "%s" "made in" property should be string or array of strings',
				messages_prefix,
				countries::text
			);
		END IF;

		IF printed_in_validated_value IS NULL THEN
			validation_errors = add_formatted_message(
				validation_errors,
				'%sValue''s "%s" "printed in" property should be string or array of strings',
				messages_prefix,
				countries::text
			);
		END IF;

		IF made_in_validated_value IS NOT NULL AND printed_in_validated_value IS NOT NULL THEN
			validated_value = jsonb_build_object('made in', made_in_validated_value, 'printed in', printed_in_validated_value);
		END IF;
	ELSIF allow_cd_slipcase_shape AND keys = '{"CD", "slipcase"}'::text[] THEN
		cd_value = jsonb_extract_path(countries, 'CD');
		slipcase_value = jsonb_extract_path(countries, 'slipcase');

		SELECT * FROM validate_release_countries_jsonb(
			cd_value,
			format('%s"CD" property:', messages_prefix),
			FALSE,
			validation_errors
		)
		INTO validation_errors, cd_validated_value;

		SELECT * FROM validate_countries_slipcase_property(
			slipcase_value,
			format('%s"slipcase" property:', messages_prefix),
			validation_errors
		)
		INTO validation_errors, slipcase_validated_value;

		IF cd_validated_value IS NOT NULL AND slipcase_validated_value IS NOT NULL THEN
			validated_value = jsonb_build_object('CD', cd_validated_value, 'slipcase', slipcase_validated_value);
		END IF;
	ELSE
		validation_errors = add_formatted_message(
			validation_errors,
			'%sValue %s is an object, but it''s shape is not correct - can either have keys "made in" and "printed in" or keys "CD" and "slipcase", and only these keys.',
			messages_prefix,
			countries::text
		);
	END IF;

	IF cardinality(validation_errors) > 0 THEN
		validated_value = NULL;
	END IF;
END;
$$ LANGUAGE plpgsql;
