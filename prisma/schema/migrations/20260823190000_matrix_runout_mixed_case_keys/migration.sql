-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

-- "digital case shape" is renamed to "mixed case shape", because its keys are no longer digital formats only.
-- Keys "3'CD", "LP" and the new "BD-A" are now allowed with an optional trailing number, same as the other format
-- keys, and are subject to the same numbering rules.

-- dropped instead of replaced, because out parameters make up the return type of a function, so renaming
-- "digital_case_keys" to "mixed_case_keys" counts as changing the return type, which "create or replace" forbids
DROP FUNCTION IF EXISTS extract_matrix_runout_jsonb_obj_keys(JSONB, TEXT, BOOLEAN, TEXT[]);
-- renamed to "validate_mixed_key_value"
DROP FUNCTION IF EXISTS validate_digital_key_value(JSONB, TEXT, TEXT, TEXT[]);

CREATE OR REPLACE FUNCTION extract_matrix_runout_jsonb_obj_keys(
	matrix_runout_value JSONB,
	messages_prefix TEXT,
	allow_only_vinyl_case BOOLEAN,
	INOUT validation_errors TEXT[],
	OUT mirrored_case_keys TEXT[],
	OUT vinyl_case_keys TEXT[],
	OUT mixed_case_keys TEXT[]
)
AS $$
DECLARE
	key_val TEXT;
	extra_key TEXT;
	has_mirrored_keys BOOLEAN;
	has_vinyl_keys BOOLEAN;
	has_mixed_keys BOOLEAN;
	mirrored_keys_are_valid BOOLEAN;
	vinyl_keys_are_valid BOOLEAN;
	mixed_case_keys_are_valid BOOLEAN;
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
		-- "BD-A" has to be listed before "BD", so that "BD-A" is not matched as "BD" followed by an invalid suffix
		ELSIF key_val ~ '^(CD|DVD|BD-A|BD|4HD_BD|3''CD|LP)([1-9]\d*)?$' THEN
			mixed_case_keys = mixed_case_keys || key_val;
		ELSE
		 	is_valid = FALSE;
		END IF;
	END LOOP;

	has_mirrored_keys = cardinality(mirrored_case_keys) > 0;
	has_vinyl_keys = cardinality(vinyl_case_keys) > 0;
	has_mixed_keys = cardinality(mixed_case_keys) > 0;

	mirrored_keys_are_valid = NOT has_mirrored_keys OR 'mirrored' = ANY(mirrored_case_keys);
	vinyl_keys_are_valid = validate_vinyl_keys(vinyl_case_keys);
	mixed_case_keys_are_valid = validate_format_keys(mixed_case_keys);

	IF NOT mirrored_keys_are_valid OR NOT vinyl_keys_are_valid OR NOT mixed_case_keys_are_valid THEN
		is_valid = FALSE;
	ELSE
		IF has_mirrored_keys THEN
			mask = mask + 1;
		END IF;

		IF has_vinyl_keys THEN
			mask = mask + 2;
		END IF;

		IF has_mixed_keys THEN
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

-- replaces "validate_digital_key_value" - same logic, but the "vinyl case shape" exception applies to every key
-- starting with "LP", not to the bare "LP" key only
CREATE OR REPLACE FUNCTION validate_mixed_key_value(
	matrix_runout_value JSONB,
	key TEXT,
	messages_prefix TEXT,
	INOUT validation_errors TEXT[],
	OUT validated_value JSONB
)
AS $$
DECLARE
	lp_case_keys TEXT[];
	lp_case_key TEXT;
	validated_prop_value JSONB;
BEGIN
	IF key ~ '^LP([1-9]\d*)?$' THEN
		SELECT res.validation_errors, res.vinyl_case_keys FROM extract_matrix_runout_jsonb_obj_keys(
			matrix_runout_value,
			messages_prefix,
			TRUE,
			validation_errors
		) AS res INTO validation_errors, lp_case_keys;

		IF lp_case_keys IS NOT NULL THEN
			-- has to be initialised, because "jsonb_set" is strict and would keep returning NULL otherwise
			validated_value = '{}';

			FOREACH lp_case_key in ARRAY lp_case_keys
			LOOP
				SELECT * FROM validate_vinyl_key_value(
					matrix_runout_value -> lp_case_key,
					format('%s"%s" key: ', messages_prefix, lp_case_key),
					validation_errors
				) INTO validation_errors, validated_prop_value;

				IF validated_prop_value IS NOT NULL THEN
					validated_value = jsonb_set(validated_value, ARRAY [lp_case_key], validated_prop_value);
				END IF;
			END LOOP;
		END IF;
	ELSIF jsonb_typeof(matrix_runout_value) = 'string' THEN
		SELECT * FROM validate_matrix_runout_as_string(
			matrix_runout_value,
			messages_prefix,
			validation_errors
		) INTO validation_errors, validated_value;
	ELSE
		SELECT * FROM validate_mirrored_case_key_value(
			matrix_runout_value,
			messages_prefix,
			validation_errors
		) INTO validation_errors, validated_value;
	END IF;
END;
$$ LANGUAGE plpgsql;

-- had to be re-created, because the call to "validate_digital_key_value" had to be changed to "validate_mixed_key_value"
CREATE OR REPLACE FUNCTION validate_release_matrix_runout_jsonb(
	matrix_runout_value JSONB,
	messages_prefix TEXT,
	INOUT validation_errors TEXT[],
	OUT validated_value JSONB
)
AS $$
DECLARE
	mirrored_case_keys TEXT[];
	vinyl_case_keys TEXT[];
	mixed_case_keys TEXT[];
	key TEXT;
	validated_prop_value JSONB;
BEGIN
	IF jsonb_typeof(matrix_runout_value) = 'null' THEN
		matrix_runout_value = NULL;

		CALL raise_notice_with_query_id(
			'%sJson "null" value was reduced to DB NULL.',
			messages_prefix
		);
	END IF;

	IF matrix_runout_value IS NULL THEN
		RETURN;
	END IF;

	IF jsonb_typeof(matrix_runout_value) = 'string' THEN
		SELECT * FROM validate_matrix_runout_as_string(
			matrix_runout_value,
			messages_prefix,
			validation_errors
		) INTO validation_errors, validated_value;

		RETURN;
	END IF;

	IF jsonb_typeof(matrix_runout_value) != 'object' THEN
		validation_errors = add_formatted_message(
			validation_errors,
			'%sInvalid value "%s" - must be jsonb object.',
			messages_prefix,
			matrix_runout_value::text
		);

		RETURN;
	END IF;

	SELECT * FROM extract_matrix_runout_jsonb_obj_keys(
		matrix_runout_value,
		messages_prefix,
		FALSE,
		validation_errors
	 ) INTO
	 	validation_errors,
		mirrored_case_keys,
		vinyl_case_keys,
		mixed_case_keys;

	IF mirrored_case_keys IS NOT NULL THEN
		SELECT * FROM validate_mirrored_case_key_value(
			matrix_runout_value,
			messages_prefix,
			validation_errors
		) INTO validation_errors, validated_value;
	END IF;

	IF vinyl_case_keys IS NOT NULL THEN
		validated_value = '{}';

		FOREACH key in ARRAY vinyl_case_keys
		LOOP
			SELECT * FROM validate_vinyl_key_value(
				matrix_runout_value -> key,
				format('%s"%s" key: ', messages_prefix, key),
				validation_errors
			) INTO validation_errors, validated_prop_value;

			IF validated_prop_value IS NOT NULL THEN
				validated_value = jsonb_set(validated_value, ARRAY [key], validated_prop_value);
			END IF;
		END LOOP;
	END IF;

	IF mixed_case_keys IS NOT NULL THEN
		validated_value = '{}';

		FOREACH key in ARRAY mixed_case_keys
		LOOP
			SELECT * FROM validate_mixed_key_value(
				matrix_runout_value -> key,
				key,
				format('%s"%s" key: ', messages_prefix, key),
				validation_errors
			) INTO validation_errors, validated_prop_value;

			IF validated_prop_value IS NOT NULL THEN
				validated_value = jsonb_set(validated_value, ARRAY [key], validated_prop_value);
			END IF;
		END LOOP;
	END IF;

	IF cardinality(validation_errors) > 0 THEN
		validated_value = NULL;
	END IF;
END;
$$ LANGUAGE plpgsql;
