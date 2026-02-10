-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

CREATE OR REPLACE FUNCTION validate_label_as_string(
	label_val JSONB,
	messages_prefix TEXT,
	INOUT labels_dict JSONB,
	INOUT labels_to_validate TEXT[],
	INOUT validation_errors TEXT[]
)
AS $$
DECLARE
	label_text_value TEXT;
	trimmed_label_text_value TEXT;
BEGIN
	IF jsonb_typeof(label_val) != 'string' THEN
		validation_errors = add_formatted_message(
			validation_errors,
			'%sInvalid value "%s" - must be a string.',
			messages_prefix,
			label_val::text
		);

		RETURN;
	END IF;

	label_text_value = JSON_VALUE(label_val, '$' RETURNING text);
	trimmed_label_text_value = trim(label_text_value);

	IF has_key(labels_dict, trimmed_label_text_value) THEN
		CALL raise_notice_with_query_id(
			'%sDuplicate label "%s" is skipped.',
			messages_prefix,
			trimmed_label_text_value
		);
	ELSE
		labels_dict = set_jsonb_value(labels_dict, trimmed_label_text_value, 'true');
		labels_to_validate = labels_to_validate || trimmed_label_text_value;

		IF trimmed_label_text_value IS DISTINCT FROM label_text_value THEN
			CALL raise_notice_with_query_id(
				'%sAutomatically trimmed value for label, original: "%s", corrected: "%s".',
				messages_prefix,
				label_text_value,
				trimmed_label_text_value
			);
		END IF;
	END IF;
END
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_cat_number_as_string(
	cat_num_val JSONB,
	messages_prefix TEXT,
	INOUT validation_errors TEXT[],
	INOUT cat_num_dict JSONB = '{}',
	OUT validated_value TEXT
)
AS $$
DECLARE
	cat_num_text_value TEXT;
	trimmed_cat_num_text_value TEXT;
BEGIN
	IF jsonb_typeof(cat_num_val) != 'string' THEN
		validation_errors = add_formatted_message(
			validation_errors,
			'%sValue "%s" for catalogue number is not valid - must be a string.',
			messages_prefix,
			cat_num_val::text
		);

		RETURN;
	END IF;

	cat_num_text_value = JSON_VALUE(cat_num_val, '$' RETURNING text);
	trimmed_cat_num_text_value = trim(cat_num_text_value);

	IF has_key(cat_num_dict, trimmed_cat_num_text_value) THEN
		CALL raise_notice_with_query_id(
			'%sDuplicate catalogue number "%s" is skipped.',
			messages_prefix,
			trimmed_cat_num_text_value
		);
	ELSE
		cat_num_dict = set_jsonb_value(cat_num_dict, trimmed_cat_num_text_value, 'true');
		validated_value = trimmed_cat_num_text_value;

		IF trimmed_cat_num_text_value IS DISTINCT FROM cat_num_text_value THEN
			CALL raise_notice_with_query_id(
				'%sAutomatically trimmed value for catalogue number, original: "%s", corrected: "%s".',
				messages_prefix,
				cat_num_text_value,
				trimmed_cat_num_text_value
			);
		END IF;
	END IF;
END
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_cat_numbers_as_array(
	cat_num_val JSONB,
	messages_prefix TEXT,
	INOUT validation_errors TEXT[],
	OUT validated_values TEXT[]
)
AS $$
DECLARE
	r RECORD;
	cat_num_text_value TEXT;
	validated_value TEXT;
	cat_num_dict JSONB = '{}';
BEGIN
	FOR r IN SELECT jsonb_array_elements(cat_num_val) AS element
    LOOP
		SELECT * FROM validate_cat_number_as_string(
			r.element,
			messages_prefix,
			validation_errors,
			cat_num_dict
		) INTO validation_errors, cat_num_dict, validated_value;

		IF validated_value IS NOT NULL THEN
			validated_values = validated_values || validated_value;
		END IF;
    END LOOP;
END
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_cat_numbers_as_string_or_array(
	cat_num_val JSONB,
	messages_prefix TEXT,
	INOUT validation_errors TEXT[],
	OUT validated_value JSONB
)
AS $$
DECLARE
	cat_num_dict JSONB = '{}';
	text_val TEXT;
	arr_val TEXT[];
BEGIN
	IF jsonb_typeof(cat_num_val) = 'string' THEN
		SELECT r.validation_errors, r.validated_value FROM validate_cat_number_as_string(
				cat_num_val,
				messages_prefix,
				cat_num_dict,
				validation_errors
			) as r INTO validation_errors, text_val;

		validated_value = to_jsonb(text_val);

		RETURN;
	END IF;

	IF jsonb_typeof(cat_num_val) != 'array' OR jsonb_array_length(cat_num_val) = 0 THEN
		validation_errors = add_formatted_message(
			validation_errors,
			'%sValue "%s" for property "cat_numbers" is not valid - must be a string or non-empty array of strings.',
			messages_prefix,
			cat_num_val::text
		);

		RETURN;
	END IF;

	SELECT * FROM validate_cat_numbers_as_array(
		cat_num_val,
		messages_prefix,
		validation_errors
	) INTO validation_errors, arr_val;

	validated_value = to_jsonb(arr_val);

	IF jsonb_array_length(validated_value) = 1 THEN
		validated_value = validated_value -> 0;

		CALL raise_notice_with_query_id(
			'%sValue "%s" is an array, but it contains only one element, so reduced to a single string value.',
			messages_prefix,
			cat_num_val::text
		);
	END IF;
END
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_cat_numbers_obj_property(
	cat_numbers_val JSONB,
	messages_prefix TEXT,
	allow_cd_slipcase_shape BOOLEAN,
	INOUT validation_errors TEXT[],
	OUT validated_value JSONB
)
AS $$
DECLARE
	keys TEXT[];
	cat_numbers_dict JSONB = '{}';
	in_uk_validated_value JSONB;
	in_europe_validated_value JSONB;
	cd_validated_value JSONB;
	slipcase_validated_value JSONB;
BEGIN
	IF jsonb_typeof(cat_numbers_val) = 'string' OR jsonb_typeof(cat_numbers_val) = 'array' THEN
		SELECT * FROM validate_cat_numbers_as_string_or_array(
			cat_numbers_val,
			messages_prefix,
			validation_errors
		) INTO validation_errors, validated_value;

		RETURN;
	END IF;

	IF jsonb_typeof(cat_numbers_val) != 'object' THEN
		validation_errors = add_formatted_message(
			validation_errors,
			'%sValue "%s" for property "cat_numbers" is not valid - must be an object, a string or an array of strings.',
			messages_prefix,
			cat_numbers_val::text
		);

		RETURN;
	END IF;

	SELECT array_agg(key)
	INTO keys
	FROM (SELECT key FROM jsonb_object_keys(cat_numbers_val) AS key ORDER BY lower(key) LIMIT 3);

	IF keys = '{"in Europe", "in UK"}'::text[] THEN

		SELECT * FROM validate_cat_numbers_as_string_or_array(
			cat_numbers_val -> 'in UK',
			messages_prefix,
			validation_errors
		) INTO validation_errors, in_uk_validated_value;

		SELECT * FROM validate_cat_numbers_as_string_or_array(
			cat_numbers_val -> 'in Europe',
			messages_prefix,
			validation_errors
		) INTO validation_errors, in_europe_validated_value;

		IF in_uk_validated_value IS NOT NULL AND in_europe_validated_value IS NOT NULL THEN
			validated_value = jsonb_build_object('in UK', in_uk_validated_value, 'in Europe', in_europe_validated_value);
		END IF;
	ELSIF allow_cd_slipcase_shape AND keys = '{"CD", "slipcase"}'::text[] THEN
		SELECT * FROM validate_cat_numbers_obj_property(
			cat_numbers_val -> 'CD',
			messages_prefix,
			FALSE,
			validation_errors
		) INTO validation_errors, cd_validated_value;

		SELECT * FROM validate_cat_numbers_obj_property(
			cat_numbers_val -> 'slipcase',
			messages_prefix,
			FALSE,
			validation_errors
		) INTO validation_errors, slipcase_validated_value;

		IF cd_validated_value IS NOT NULL AND slipcase_validated_value IS NOT NULL THEN
			validated_value = jsonb_build_object('CD', cd_validated_value, 'slipcase', slipcase_validated_value);
		END IF;
	ELSE
		validation_errors = add_formatted_message(
			validation_errors,
			'%sValue %s for "cat_numbers" is an object, but it''s shape is not correct - can either have keys "in UK" and "in Europe" or keys "CD" and "slipcase", and only these keys.',
			messages_prefix,
			cat_numbers_val::text
		);
	END IF;
END
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION extract_cat_numbers_jsonb_obj_keys(
	cat_numbers_value JSONB,
	messages_prefix TEXT,
	INOUT validation_errors TEXT[],
	OUT labels_key TEXT,
	OUT cat_numbers_key TEXT
)
AS $$
DECLARE
	key_val TEXT;
	extra_key TEXT;
BEGIN
	-- extract at most three keys (valid object should contain at most two)
	FOR key_val IN
		SELECT jsonb_object_keys(cat_numbers_value) LIMIT 3
	LOOP
		IF key_val  ~ '^labels?$' AND labels_key IS NULL THEN
			labels_key = key_val;
		ELSIF key_val  ~ '^cat_numbers?$' AND cat_numbers_key IS NULL THEN
			cat_numbers_key = key_val;
		ELSE
			extra_key = key_val;
		END IF;
	END LOOP;

	IF (labels_key IS NULL AND cat_numbers_key IS NULL) OR extra_key IS NOT NULL THEN
		validation_errors = add_formatted_message(
			validation_errors,
			'%sValue is invalid - is json object but has wrong keys. Only optional properties "label(s)" and "cat_number(s)"" are allowed and at least one is required. If "label" key is present, "labels" key is not permitted and vice versa. Similarly for "cat_number(s)" keys.',
			messages_prefix,
			cat_numbers_value::text
		);
	END IF;
END;
$$ LANGUAGE plpgsql;

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
		 	validation_errors
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


CREATE OR REPLACE FUNCTION validate_release_cat_numbers_jsonb(
	cat_numbers_value JSONB,
	messages_prefix TEXT,
	allow_array BOOLEAN,
	INOUT validation_errors TEXT[],
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
