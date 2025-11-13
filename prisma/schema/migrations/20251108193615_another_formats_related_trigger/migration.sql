-- This migration had to be generated empty with --create-only command and populated manually, because it's content cannot be expressed in Prisma schema

CREATE OR REPLACE FUNCTION validate_speed_as_string(
	speed JSONB,
	message_prefix TEXT,
	format RECORD,
	INOUT validation_errors TEXT[],
	OUT validated_val JSONB
)
AS $$
DECLARE
	speed_str TEXT;
	trimmed_speed_str TEXT;
	valid_enum_values TEXT[] = enum_range(NULL::"VINYL_SPEED")::TEXT[];
BEGIN
	IF jsonb_typeof(speed) != 'string' THEN
		validation_errors = add_formatted_message(
			validation_errors,
			'%sValue "%s" for "speed" is not valid - must be one of values %s.',
			message_prefix,
			speed::TEXT,
			array_to_string(valid_enum_values, ', ')
		);

		RETURN;
	END IF;

	speed_str = JSON_VALUE(speed, '$' RETURNING text);
	trimmed_speed_str = trim(speed_str);

	IF trimmed_speed_str = ANY(valid_enum_values) THEN
		IF trimmed_speed_str = format.default_speed::TEXT THEN
			validation_errors = add_formatted_message(
				validation_errors,
				'%sValue "%s" for "speed" can not be same as the default speed of corresponding format. Format: "%s".',
				message_prefix,
				trimmed_speed_str,
				format.short_name
			);
		ELSIF trimmed_speed_str IS DISTINCT FROM speed_str THEN
			CALL raise_notice_with_query_id(
				'%sAutomatically trimmed leading/trailing spaces from "speed". Original: "%s", Corrected: "%s".',
				message_prefix,
				speed_str,
				trimmed_speed_str
			);
		END IF;

		validated_val = to_jsonb(trimmed_speed_str);

		RETURN;
	END IF;

	validation_errors = add_formatted_message(
		validation_errors,
		'%sValue "%s" for "speed" is a string, but it''s (trimmed) value does not correspond to any valid value for speed. Valid values are: %s.',
		message_prefix,
		speed_str,
		array_to_string(valid_enum_values, ', ')
	);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_speed_jsonb(
	speed JSONB,
	message_prefix TEXT,
	format RECORD,
	INOUT validation_errors TEXT[],
	OUT validated_val JSONB
)
AS $$
DECLARE
	speed_obj_key TEXT;
	speed_obj_val JSONB;
	validated_speed_str JSONB;
BEGIN
	IF jsonb_typeof(speed) = 'object' THEN
		validated_val = '{}';

		FOR speed_obj_key, speed_obj_val IN SELECT * FROM jsonb_each(speed)
		LOOP
			IF NOT speed_obj_key  ~ 'Side ([A-Z]|AA)' THEN
				validation_errors = add_formatted_message(
					validation_errors,
					'%sKey "%s" for "speed" object is not valid - must be of form "Side [A-Z]" or "Side AA".',
					message_prefix,
					speed_obj_key
				);
			ELSE
				SELECT * FROM validate_speed_as_string(speed_obj_val, format('%sValue of key "%s": ', message_prefix, speed_obj_key), format, validation_errors)
				INTO validation_errors, validated_speed_str;

				IF validated_speed_str IS NOT NULL THEN
					validated_val = set_jsonb_value(validated_val, speed_obj_key, validated_speed_str);
				END IF;
			END IF;
		END LOOP;

		RETURN;
	END IF;

	SELECT * FROM validate_speed_as_string(speed, message_prefix, format, validation_errors)
	INTO validation_errors, validated_val;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_formats_of_releases()
RETURNS TRIGGER AS $$
DECLARE
	format RECORD;
	validation_errors TEXT[];
	message_prefix TEXT;
	validated_speed_value JSONB;
BEGIN
	SELECT * FROM releases_formats WHERE format_id = NEW.format_id INTO format;

	message_prefix = format('Release/format relation "%s" (format "%s", release "%s"): ', NEW.uuid, format.short_name, NEW.release_id);

	IF NEW.jukebox_hole THEN
		IF format.short_name <> '7''''' THEN
			validation_errors = add_formatted_message(
				validation_errors,
				'%s"Jukebox hole" can be true only if format is 7''''. Instead got format "%s".',
				message_prefix,
				format.short_name
			);
		END IF;
	END IF;

	IF NEW.amount <= 0 THEN
		validation_errors = add_formatted_message(
			validation_errors,
			'%s"Amount" must be a positive integer. Instead got value "%s".',
			message_prefix,
			NEW.amount::TEXT
		);
	END IF;

	IF NEW.speed IS NOT NULL THEN
		IF format.default_speed IS NULL THEN
			validation_errors = add_formatted_message(
				validation_errors,
				'%sSpeed can be specified only when format has "default_speed". Format "%s" does not have "default_speed".',
				message_prefix,
				format.short_name
			);
		ELSE
			SELECT * FROM validate_speed_jsonb(NEW.speed, message_prefix, format, validation_errors)
			INTO validation_errors, validated_speed_value;

			NEW.speed = validated_speed_value;
		END IF;
	END IF;

	IF cardinality(validation_errors) > 0 THEN
		CALL array_of_errors_to_exception(validation_errors);
	END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER validate_formats_of_releases
BEFORE INSERT OR UPDATE ON formats_of_releases
FOR EACH ROW
EXECUTE FUNCTION validate_formats_of_releases();
