import type { ReleaseFormCatNumbersDraft } from "../formValues";

import type {
  FormFeedbackMessages,
  FormValidationFnResult,
} from "@/hooks/useFormState";
import { formatJson } from "@/utils/common";
import { parseYAML } from "@/utils/parsing";
import { releaseCatNumbersSchema, type ReleaseCatNumbers } from "@/validation";

const INVALID_SYNTAX_MESSAGE =
  "Catalogue numbers must be empty or a valid JSON/YAML value (object or array; keys and string values may be unquoted).";

export const parseReleaseCatNumbersJsonInput = (
  jsonInput: string,
): ReleaseCatNumbers => {
  const trimmed = jsonInput.trim();

  if (!trimmed) {
    return null;
  }

  const yamlParsingResult = parseYAML(trimmed);

  if (!yamlParsingResult) {
    throw new Error(INVALID_SYNTAX_MESSAGE);
  }

  return releaseCatNumbersSchema.parse(yamlParsingResult.parsed);
};

export const validateReleaseCatNumbersJsonInput = (
  value: string,
): FormValidationFnResult<ReleaseFormCatNumbersDraft> => {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      validatedValue: { activeTab: "json", value: trimmed },
      notifications: [],
    };
  }

  const trimmedNotifications: FormFeedbackMessages =
    trimmed === value ? [] : [{ message: "Note: value has been trimmed" }];

  const yamlParsingResult = parseYAML(trimmed);

  if (!yamlParsingResult) {
    return {
      value: { activeTab: "json", value: trimmed },
      errors: [{ message: "Invalid JSON value" }],
      notifications: trimmedNotifications,
    };
  }

  const { parsed } = yamlParsingResult;

  const validationResult = releaseCatNumbersSchema.safeParse(parsed);
  const prettifiedValue = formatJson(parsed) ?? "";

  const notifications: FormFeedbackMessages =
    prettifiedValue === value
      ? []
      : [{ message: "Note: JSON value has been pretty-printed" }];

  if (!validationResult.success) {
    return {
      value: { activeTab: "json", value: prettifiedValue },
      errors: validationResult.error.issues.map(({ message }) => ({
        message,
      })),
      notifications,
    };
  }

  return {
    validatedValue: { activeTab: "json", value: prettifiedValue },
    notifications,
  };
};
