-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

CREATE OR REPLACE FUNCTION validate_matrix_runout_as_string(
	matrix_runout_val JSONB,
	messages_prefix TEXT,
	INOUT validation_errors TEXT[],
	OUT validated_value JSONB
)
AS $$
DECLARE
	matrix_runout_text_value TEXT;
	trimmed_matrix_runout_text_value TEXT;
BEGIN
	IF jsonb_typeof(matrix_runout_val) != 'string' THEN
		validation_errors = add_formatted_message(
			validation_errors,
			'%sInvalid value "%s" - must be a string.',
			messages_prefix,
			matrix_runout_val::text
		);

		RETURN;
	END IF;

	matrix_runout_text_value = JSON_VALUE(matrix_runout_val, '$' RETURNING text);
	trimmed_matrix_runout_text_value = trim(matrix_runout_text_value);

	IF trimmed_matrix_runout_text_value IS DISTINCT FROM matrix_runout_text_value THEN
		CALL raise_notice_with_query_id(
			'%sAutomatically trimmed value for matrix_runout, original: "%s", corrected: "%s".',
			messages_prefix,
			matrix_runout_text_value,
			trimmed_matrix_runout_text_value
		);
	END IF;

	validated_value = to_jsonb(trimmed_matrix_runout_text_value);
END
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_digital_matrix_runout_keys(
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
		SELECT (regexp_match(k, '^(CD|DVD|BD|4HD_BD)(\d*)$'))[2]
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

CREATE OR REPLACE FUNCTION validate_digital_keys(
	digital_case_keys TEXT[]
) RETURNS BOOLEAN
AS $$
DECLARE
	key TEXT;
	cd_keys TEXT[];
	dvd_keys TEXT[];
	bd_keys TEXT[];
	hd_bd_keys TEXT[];
	is_sequential BOOLEAN;
BEGIN
	IF digital_case_keys IS NULL THEN
		RETURN TRUE;
	END IF;

	FOREACH key in ARRAY digital_case_keys LOOP
		IF key ~ '^CD\d*$' THEN
			cd_keys = cd_keys || key;
		ELSIF key ~ '^DVD\d*$' THEN
			dvd_keys = dvd_keys || key;
		ELSIF key ~ '^BD\d*$' THEN
			bd_keys = bd_keys || key;
		ELSIF key ~ '^4HD_BD\d*$' THEN
			hd_bd_keys = hd_bd_keys || key;
		END IF;
	END LOOP;

	IF
		('CD' = ANY(cd_keys) AND cardinality(cd_keys) > 1) OR
		('DVD' = ANY(dvd_keys) AND cardinality(dvd_keys) > 1) OR
		('BD' = ANY(bd_keys) AND cardinality(bd_keys) > 1) OR
		('4HD_BD' = ANY(hd_bd_keys) AND cardinality(hd_bd_keys) > 1) THEN
		RETURN FALSE;
	END IF;

	RETURN check_digital_matrix_runout_keys(cd_keys) AND check_digital_matrix_runout_keys(dvd_keys) AND check_digital_matrix_runout_keys(bd_keys) AND check_digital_matrix_runout_keys(hd_bd_keys);
END
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_vinyl_keys(
	vinyl_case_keys TEXT[]
) RETURNS BOOLEAN
AS $$
DECLARE
	side_letters TEXT[];
	is_sequential BOOLEAN;
BEGIN
	IF vinyl_case_keys IS NULL THEN
		RETURN TRUE;
	END IF;

	IF 'Both A sides' = ANY(vinyl_case_keys) THEN
		RETURN cardinality(vinyl_case_keys) = 1;
	END IF;

	IF 'Side AA' = ANY(vinyl_case_keys) THEN
		RETURN cardinality(vinyl_case_keys) = 2 AND 'Side A' = ANY(vinyl_case_keys);
	END IF;

	IF 'Mono side' = ANY(vinyl_case_keys) OR 'Stereo side' = ANY(vinyl_case_keys) THEN
		RETURN cardinality(vinyl_case_keys) = 2 AND 'Mono side' = ANY(vinyl_case_keys) AND 'Stereo side' = ANY(vinyl_case_keys);
	END IF;

	IF 'Side A' != ALL(vinyl_case_keys) AND 'Side X' != ALL(vinyl_case_keys) THEN
		RETURN FALSE;
	END IF;

	SELECT ARRAY(
		SELECT (regexp_match(k, '^Side ([A-Z])$'))[1]
		FROM unnest(vinyl_case_keys) AS k
	) INTO side_letters;

	SELECT (MAX(ascii(letter)) - MIN(ascii(letter)) + 1) = COUNT(DISTINCT letter)
	FROM unnest(side_letters) AS letter INTO is_sequential;

	RETURN is_sequential;
END
$$ LANGUAGE plpgsql;

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
		ELSIF key_val ~ '^(CD|DVD|BD|4HD_BD)[1-9]?\d*$' OR key_val = '3''CD' OR key_val = 'LP' THEN
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
	digital_case_keys_are_valid = validate_digital_keys(digital_case_keys);

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

CREATE OR REPLACE FUNCTION validate_mirrored_case_key_value(
	matrix_runout_value JSONB,
	messages_prefix TEXT,
	INOUT validation_errors TEXT[],
	OUT validated_value JSONB
)
AS $$
DECLARE
	has_etched_key BOOLEAN;
	validated_prop_value JSONB;
	allowed_keys JSONB := '["mirrored", "normal"]';
  has_only_allowed_keys BOOLEAN;
	key TEXT;
BEGIN
	IF jsonb_typeof(matrix_runout_value) != 'object' THEN
		validation_errors = add_formatted_message(
			validation_errors,
			'%sInvalid value "%s" - must be jsonb object.',
			messages_prefix,
			matrix_runout_value::text
		);

		RETURN;
	END IF;

	has_only_allowed_keys := (SELECT jsonb_agg(k) FROM jsonb_object_keys(matrix_runout_value) k) <@ allowed_keys;

	IF NOT has_only_allowed_keys THEN
		validation_errors = add_formatted_message(
			validation_errors,
			'%sInvalid value "%s" - only keys "mirrored" and "normal" are allowed.',
			messages_prefix,
			matrix_runout_value::text
		);

		RETURN;
	END IF;

	IF NOT matrix_runout_value ? 'mirrored' THEN
		validation_errors = add_formatted_message(
				validation_errors,
				'%sInvalid value "%s" - must have "mirrored" property.',
				messages_prefix,
				matrix_runout_value::text
			);

		RETURN;
	END IF;

	validated_value = '{}';

	FOR key IN SELECT jsonb_object_keys(matrix_runout_value) LOOP
		SELECT * FROM validate_matrix_runout_as_string(
			matrix_runout_value -> key,
			format('%s"%s" key: ', messages_prefix, key),
			validation_errors
		) INTO validation_errors, validated_prop_value;

		IF validated_prop_value IS NOT NULL THEN
			validated_value = jsonb_set(validated_value, ARRAY [key], validated_prop_value);
		END IF;
	END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_digital_key_value(
	matrix_runout_value JSONB,
	key TEXT,
	messages_prefix TEXT,
	INOUT validation_errors TEXT[],
	OUT validated_value JSONB
)
AS $$
DECLARE
	lp_case_keys TEXT[];
	validated_prop_value JSONB;
BEGIN
	IF key = 'LP' THEN
		SELECT res.validation_errors, res.vinyl_case_keys FROM extract_matrix_runout_jsonb_obj_keys(
			matrix_runout_value,
			messages_prefix,
			TRUE,
			validation_errors
		) AS res INTO validation_errors, lp_case_keys;

		IF lp_case_keys IS NOT NULL THEN
			FOREACH key in ARRAY lp_case_keys
			LOOP
				SELECT * FROM validate_vinyl_key_value(
					matrix_runout_value -> key,
					format('%s"LP" key: "%s" key: ', messages_prefix, key),
					validation_errors
				) INTO validation_errors, validated_prop_value;

				IF validated_prop_value IS NOT NULL THEN
					validated_value = jsonb_set(validated_value, ARRAY [key], validated_prop_value);
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

CREATE OR REPLACE FUNCTION validate_vinyl_key_value(
	matrix_runout_value JSONB,
	messages_prefix TEXT,
	INOUT validation_errors TEXT[],
	OUT validated_value JSONB
)
AS $$
DECLARE
	has_etched_key BOOLEAN;
	validated_prop_value JSONB;
	allowed_keys JSONB := '["etched", "stamped", "comment"]';
  has_only_allowed_keys BOOLEAN;
	key TEXT;
BEGIN
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

	has_only_allowed_keys := (SELECT jsonb_agg(k) FROM jsonb_object_keys(matrix_runout_value) k) <@ allowed_keys;

	IF NOT has_only_allowed_keys THEN
		validation_errors = add_formatted_message(
			validation_errors,
			'%sInvalid value "%s" - only keys "etched", "stamped" and "comment" are allowed.',
			messages_prefix,
			matrix_runout_value::text
		);

		RETURN;
	END IF;

	IF NOT matrix_runout_value ? 'etched' THEN
		validation_errors = add_formatted_message(
				validation_errors,
				'%sInvalid value "%s" - must have "etched" property.',
				messages_prefix,
				matrix_runout_value::text
			);

		RETURN;
	END IF;

	validated_value = '{}';

	FOR key IN SELECT jsonb_object_keys(matrix_runout_value) LOOP
		SELECT * FROM validate_matrix_runout_as_string(
			matrix_runout_value -> key,
			format('%s"%s" key: ', messages_prefix, key),
			validation_errors
		) INTO validation_errors, validated_prop_value;

		IF validated_prop_value IS NOT NULL THEN
			validated_value = jsonb_set(validated_value, ARRAY [key], validated_prop_value);
		END IF;
	END LOOP;
END;
$$ LANGUAGE plpgsql;

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
	digital_case_keys TEXT[];
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
		digital_case_keys;

	IF mirrored_case_keys IS NOT NULL THEN
		SELECT * FROM validate_mirrored_case_key_value(
			matrix_runout_value,
			messages_prefix,
			validation_errors
		) INTO validation_errors, validated_value;
	END IF;

	validated_value = '{}';

	IF vinyl_case_keys IS NOT NULL THEN
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

	IF digital_case_keys IS NOT NULL THEN
		FOREACH key in ARRAY digital_case_keys
		LOOP
			SELECT * FROM validate_digital_key_value(
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
