-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

-- "check_digital_matrix_runout_keys" and "validate_digital_keys" are replaced by "check_numbered_format_keys" and
-- "validate_format_keys" - same logic, but generalized over all format keys, so that it can be shared between
-- matrix/runout and catalogue numbers validation
DROP FUNCTION IF EXISTS validate_digital_keys(TEXT[]);
DROP FUNCTION IF EXISTS check_digital_matrix_runout_keys(TEXT[]);

CREATE OR REPLACE FUNCTION check_numbered_format_keys(
	keys TEXT[]
) RETURNS BOOLEAN
AS $$
DECLARE
	numbers TEXT[];
	is_sequential BOOLEAN;
BEGIN
	IF keys IS NULL OR cardinality(keys) = 0 THEN
		RETURN TRUE;
	END IF;

	SELECT ARRAY(
		SELECT (regexp_match(k, '(\d*)$'))[1]
		FROM unnest(keys) AS k
	) INTO numbers;

	IF '' = ANY(numbers) THEN
		RETURN cardinality(keys) = 1;
	END IF;

	IF '1' != ALL(numbers) THEN
		RETURN FALSE;
	END IF;

	SELECT MAX(n::int) = COUNT(numbers)
	FROM unnest(numbers) AS n INTO is_sequential;

	RETURN is_sequential;
END
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_format_keys(
	format_keys TEXT[]
) RETURNS BOOLEAN
AS $$
DECLARE
	format_prefix TEXT;
	category_keys TEXT[];
BEGIN
	IF format_keys IS NULL THEN
		RETURN TRUE;
	END IF;

	FOR format_prefix IN
		SELECT DISTINCT regexp_replace(k, '\d+$', '')
		FROM unnest(format_keys) AS k
	LOOP
		SELECT ARRAY(
			SELECT k
			FROM unnest(format_keys) AS k
			WHERE regexp_replace(k, '\d+$', '') = format_prefix
		) INTO category_keys;

		IF NOT check_numbered_format_keys(category_keys) THEN
			RETURN FALSE;
		END IF;
	END LOOP;

	RETURN TRUE;
END
$$ LANGUAGE plpgsql;

-- had to be re-created, because name of the function "validate_digital_keys" was changed to "validate_format_keys"
CREATE OR REPLACE FUNCTION extract_matrix_runout_jsonb_obj_keys(
	matrix_runout_value JSONB,
	messages_prefix TEXT,
	allow_only_vinyl_case BOOLEAN,
	INOUT validation_errors TEXT[],
	OUT mirrored_case_keys TEXT[],
	OUT vinyl_case_keys TEXT[],
	OUT digital_case_keys TEXT[]
)
AS $$
DECLARE
	key_val TEXT;
	extra_key TEXT;
	has_mirrored_keys BOOLEAN;
	has_vinyl_keys BOOLEAN;
	has_digital_keys BOOLEAN;
	mirrored_keys_are_valid BOOLEAN;
	vinyl_keys_are_valid BOOLEAN;
	digital_case_keys_are_valid BOOLEAN;
	mask INT = 0;
	is_valid BOOLEAN = TRUE;
BEGIN
	FOR key_val IN
		SELECT jsonb_object_keys(matrix_runout_value)
	LOOP
		IF key_val  = 'mirrored' OR key_val = 'normal' THEN
			mirrored_case_keys = mirrored_case_keys || key_val;
		ELSIF key_val  ~ '^Side [A-Z]$' OR key_val = 'Side AA' OR key_val  ~ '^(Mono|Stereo) side$' OR key_val = 'Both A sides' THEN
			vinyl_case_keys = vinyl_case_keys || key_val;
		ELSIF key_val ~ '^(CD|DVD|BD|4HD_BD)([1-9]\d*)?$' OR key_val = '3''CD' OR key_val = 'LP' THEN
			digital_case_keys = digital_case_keys || key_val;
		ELSE
		 	is_valid = FALSE;
		END IF;
	END LOOP;

	has_mirrored_keys = cardinality(mirrored_case_keys) > 0;
	has_vinyl_keys = cardinality(vinyl_case_keys) > 0;
	has_digital_keys = cardinality(digital_case_keys) > 0;

	mirrored_keys_are_valid = NOT has_mirrored_keys OR 'mirrored' = ANY(mirrored_case_keys);
	vinyl_keys_are_valid = validate_vinyl_keys(vinyl_case_keys);
	digital_case_keys_are_valid = validate_format_keys(digital_case_keys);

	IF NOT mirrored_keys_are_valid OR NOT vinyl_keys_are_valid OR NOT digital_case_keys_are_valid THEN
		is_valid = FALSE;
	ELSE
		IF has_mirrored_keys THEN
			mask = mask + 1;
		END IF;

		IF has_vinyl_keys THEN
			mask = mask + 2;
		END IF;

		IF has_digital_keys THEN
			mask = mask + 4;
		END IF;

		is_valid = (mask = 1 OR mask = 2 OR mask = 4);
	END IF;

	IF allow_only_vinyl_case AND NOT has_vinyl_keys THEN
		is_valid = FALSE;
	END IF;

	IF NOT is_valid THEN
		validation_errors = add_formatted_message(
			validation_errors,
			'%sValue is invalid - is a json object but has wrong keys. Check documentation for which keys are allowed.',
			messages_prefix
		);
	END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION extract_cat_numbers_format_keys(
	cat_numbers_value JSONB,
	messages_prefix TEXT,
	INOUT validation_errors TEXT[],
	OUT format_keys TEXT[]
)
AS $$
DECLARE
	key_val TEXT;
	has_other_keys BOOLEAN = FALSE;
BEGIN
	FOR key_val IN
		SELECT jsonb_object_keys(cat_numbers_value)
	LOOP
		IF key_val ~ '^(CD|DVD|BD|4HD_BD|3''CD|LP|TC)([1-9]\d*)?$' THEN
			format_keys = format_keys || key_val;
		ELSE
			has_other_keys = TRUE;
		END IF;
	END LOOP;

	IF format_keys IS NULL THEN
		RETURN;
	END IF;

	IF has_other_keys THEN
		validation_errors = add_formatted_message(
			validation_errors,
			'%sValue is invalid - is a json object with format keys (like "CD", "DVD2" or "LP"), so no other keys are allowed.',
			messages_prefix
		);
	END IF;

	IF NOT validate_format_keys(format_keys) THEN
		validation_errors = add_formatted_message(
			validation_errors,
			'%sValue is invalid - format keys are numbered incorrectly. Every format must either be present as a single key without a number, or as keys numbered sequentially starting from 1.',
			messages_prefix
		);
	END IF;
END;
$$ LANGUAGE plpgsql;

-- had to be re-created, because the call to "validate_release_cat_numbers_jsonb" had to be changed to include the new "allow_format_keys" parameter
CREATE OR REPLACE FUNCTION validate_release_cat_numbers_jsonb_array(
	cat_numbers_value JSONB,
	messages_prefix TEXT,
	INOUT validation_errors TEXT[],
	OUT validated_value JSONB
)
AS $$
DECLARE
	arr_element JSONB;
	validated_element JSONB;
BEGIN
	validated_value = '[]'::jsonb;

	FOR arr_element IN SELECT value FROM jsonb_array_elements(cat_numbers_value)
	LOOP
		SELECT * FROM validate_release_cat_numbers_jsonb(
			arr_element,
			messages_prefix,
			FALSE,
		 	validation_errors,
			FALSE
		)
		INTO validation_errors, validated_element;

		IF validated_element IS NOT NULL THEN
			validated_value = validated_value || validated_element;
		END IF;
	END LOOP;

	IF cardinality(validation_errors) > 0 THEN
		validated_value = NULL;
	END IF;
END;
$$ LANGUAGE plpgsql;

-- recreated with an additional "allow_format_keys" parameter, so the old version has to be dropped first
DROP FUNCTION IF EXISTS validate_release_cat_numbers_jsonb(JSONB, TEXT, BOOLEAN, TEXT[]);

CREATE OR REPLACE FUNCTION validate_release_cat_numbers_jsonb(
	cat_numbers_value JSONB,
	messages_prefix TEXT,
	allow_array BOOLEAN,
	INOUT validation_errors TEXT[],
	allow_format_keys BOOLEAN = TRUE,
	OUT validated_value JSONB
)
AS $$
DECLARE
	keys TEXT[];
	labels_key TEXT;
	cat_numbers_key TEXT;
	labels_to_validate TEXT[];
	labels_dict JSONB = '{}';
	label_val JSONB;
	label_validation_result RECORD;
	validated_labels TEXT[];
	validated_cat_number TEXT;
	validated_cat_numbers JSONB;
	cat_numbers_dict JSONB = '{}';
	format_keys TEXT[];
	format_key TEXT;
	validated_format_key_value JSONB;
BEGIN
	IF jsonb_typeof(cat_numbers_value) = 'null' THEN
		cat_numbers_value = NULL;

		CALL raise_notice_with_query_id(
			'%sJson "null" value was reduced to DB NULL.',
			messages_prefix
		);
	END IF;

	IF cat_numbers_value IS NULL THEN
		RETURN;
	END IF;

	IF jsonb_typeof(cat_numbers_value) = 'array' AND allow_array THEN
		SELECT * FROM validate_release_cat_numbers_jsonb_array(
			cat_numbers_value,
			messages_prefix,
			validation_errors
		) INTO validation_errors, validated_value;

		RETURN;
	END IF;

	IF jsonb_typeof(cat_numbers_value) != 'object' THEN
		validation_errors = add_formatted_message(
			validation_errors,
			'%sInvalid value "%s" - must be jsonb object.',
			messages_prefix,
			cat_numbers_value::text
		);

		RETURN;
	END IF;

	IF allow_format_keys THEN
		SELECT * FROM extract_cat_numbers_format_keys(
			cat_numbers_value,
			messages_prefix,
			validation_errors
		) INTO validation_errors, format_keys;
	END IF;

	IF format_keys IS NOT NULL THEN
		validated_value = '{}';

		FOREACH format_key IN ARRAY format_keys
		LOOP
			IF jsonb_typeof(cat_numbers_value -> format_key) = 'null' THEN
				validation_errors = add_formatted_message(
					validation_errors,
					'%s"%s" key: null value is not allowed - must be a jsonb object or an array of jsonb objects.',
					messages_prefix,
					format_key
				);
			ELSE
				SELECT * FROM validate_release_cat_numbers_jsonb(
					cat_numbers_value -> format_key,
					format('%s"%s" key: ', messages_prefix, format_key),
					TRUE,
					validation_errors,
					FALSE
				) INTO validation_errors, validated_format_key_value;

				IF validated_format_key_value IS NOT NULL THEN
					validated_value = jsonb_set(validated_value, ARRAY [format_key], validated_format_key_value);
				END IF;
			END IF;
		END LOOP;

		IF cardinality(validation_errors) > 0 THEN
			validated_value = NULL;
		END IF;

		RETURN;
	END IF;

	SELECT * FROM extract_cat_numbers_jsonb_obj_keys(
		cat_numbers_value,
		messages_prefix,
		validation_errors
	 ) INTO validation_errors, labels_key, cat_numbers_key;

	validated_value = '{}';

	IF labels_key IS NOT NULL THEN
		IF labels_key = 'label' THEN
			SELECT * FROM validate_label_as_string(
				cat_numbers_value -> labels_key,
				format('%s"label" key: ', messages_prefix),
				labels_dict,
				labels_to_validate,
				validation_errors
			) INTO labels_dict, labels_to_validate, validation_errors;
		ELSE
			IF jsonb_typeof(cat_numbers_value -> labels_key) = 'array' THEN
				FOR label_val IN
				SELECT value FROM jsonb_array_elements(cat_numbers_value -> labels_key)
				LOOP
					SELECT * FROM validate_label_as_string(
						label_val,
						format('%s"labels" key''s array value''s element: ', messages_prefix),
						labels_dict,
						labels_to_validate,
						validation_errors
					)
					INTO labels_dict, labels_to_validate, validation_errors;
				END LOOP;

				IF jsonb_array_length(cat_numbers_value -> labels_key) = 0 THEN
					validation_errors = add_formatted_message(
						validation_errors,
						'%s"labels" key is an empty array.',
						messages_prefix
					);
				END IF;
			ELSIF jsonb_typeof(cat_numbers_value -> labels_key) = 'string' THEN
				SELECT * FROM validate_label_as_string(
					cat_numbers_value -> labels_key,
					format('%s"label" key: ', messages_prefix),
					labels_dict,
					labels_to_validate,
					validation_errors
			) INTO labels_dict, labels_to_validate, validation_errors;
			ELSE
				validation_errors = add_formatted_message(
					validation_errors,
					'%s"labels" key''s value "%s" is not a list of labels.',
					messages_prefix,
					cat_numbers_value::text,
					(cat_numbers_value -> labels_key)::text
				);
			END IF;
		END IF;

		FOR label_validation_result IN
			SELECT
				arr.label_val,
				l.name
			FROM
				unnest(labels_to_validate) WITH ORDINALITY AS arr(label_val, idx)
			LEFT JOIN
				labels AS l ON arr.label_val = l.name
			ORDER BY
				arr.idx
		LOOP
			IF label_validation_result.name IS NULL THEN
				validation_errors = add_formatted_message(
					validation_errors,
					'%sValue "%s" does not correspond to any label''s name in "labels" table.',
					messages_prefix,
					label_validation_result.label_val
				);
			ELSE
				validated_labels = validated_labels || label_validation_result.name;
			END IF;
		END LOOP;

		IF cardinality(validated_labels) = 1 THEN
			validated_value = jsonb_set(validated_value, '{label}', to_jsonb(validated_labels[1]));

			IF labels_key = 'labels' THEN
				CALL raise_notice_with_query_id(
					'%sValue "%s" for "labels" contains only one element, so was reduced to "label" key.',
					messages_prefix,
					validated_labels::text
				);
			END IF;
		ELSE
			validated_value = jsonb_set(validated_value, '{labels}', to_jsonb(validated_labels));
		END IF;
	END IF;

	IF cat_numbers_key IS NOT NULL THEN
		IF cat_numbers_key = 'cat_number' THEN
				SELECT r.validation_errors, r.validated_value FROM validate_cat_number_as_string(
					cat_numbers_value -> cat_numbers_key,
					messages_prefix,
					validation_errors
				) AS r INTO validation_errors, validated_cat_number;

				IF validated_cat_number IS NOT NULL THEN
					validated_cat_numbers = to_jsonb(validated_cat_number);
				END IF;
		ELSE
			SELECT * FROM validate_cat_numbers_obj_property(
					cat_numbers_value -> cat_numbers_key,
					messages_prefix,
					TRUE,
					validation_errors
			) INTO validation_errors, validated_cat_numbers;
		END IF;

		IF jsonb_typeof(validated_cat_numbers) = 'string' THEN
				validated_value = jsonb_set(validated_value, '{cat_number}', validated_cat_numbers);

				IF cat_numbers_key = 'cat_numbers' THEN
					CALL raise_notice_with_query_id(
						'%sValue %s for "cat_numbers" contains only one element, so was reduced to "cat_number" key.',
						messages_prefix,
						validated_cat_numbers::text
					);
				END IF;
		ELSIF validated_cat_numbers IS NOT NULL THEN
			validated_value = jsonb_set(validated_value, '{cat_numbers}', validated_cat_numbers);
		END IF;
	END IF;

	IF cardinality(validation_errors) > 0 THEN
		validated_value = NULL;
	END IF;
END;
$$ LANGUAGE plpgsql;
