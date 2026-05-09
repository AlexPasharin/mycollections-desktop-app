import type { FormFieldValidationResult } from "./types";

export const validateOptionalTrimmedText = (
  value: string,
): FormFieldValidationResult<string, never> => {
  const trimmed = value.trim();

  return {
    valid: true,
    value: trimmed,
    notifications:
      trimmed === value
        ? undefined
        : [{ notification: "Note: value has been trimmed" }],
  };
};
