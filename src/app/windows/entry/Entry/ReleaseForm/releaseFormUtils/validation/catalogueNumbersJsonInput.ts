import type { ReleaseFormCatNumbersFieldErrors } from "../errorMessages";
import type { ReleaseFormCatNumbersDraft } from "../formValues";

import type { FormFieldValidationResult } from "@/types/form";
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
): FormFieldValidationResult<
  ReleaseFormCatNumbersDraft,
  ReleaseFormCatNumbersFieldErrors
> => {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      valid: true,
      value: {
        activeTab: "json",
        value: trimmed,
      },
    };
  }

  const yamlParsingResult = parseYAML(trimmed);

  if (!yamlParsingResult) {
    return {
      valid: false,
      value: {
        activeTab: "json",
        value: trimmed,
      },
      notifications:
        trimmed === value
          ? undefined
          : [{ notification: "Note: value has been trimmed" }],
      errorMessages: {
        rows: {},
        jsonInput: [{ message: "Invalid JSON value" }],
      },
    };
  }

  const { parsed } = yamlParsingResult;

  const validationResult = releaseCatNumbersSchema.safeParse(parsed);
  const prettifiedValue = formatJson(parsed) ?? "";

  const notifications =
    prettifiedValue === value
      ? undefined
      : [{ notification: "Note: JSON value has been pretty-printed" }];

  if (!validationResult.success) {
    return {
      valid: false,
      value: {
        activeTab: "json",
        value: prettifiedValue,
      },
      notifications,
      errorMessages: {
        rows: {},
        jsonInput: validationResult.error.issues.map(({ message }) => ({
          message,
        })),
      },
    };
  }

  return {
    valid: true,
    value: {
      activeTab: "json",
      value: prettifiedValue,
    },
    notifications,
  };
};
