import type { FormFieldValidationResult } from "@/types/form";

export const validateRequiredTrimmedText =
  (requiredMessage: string) =>
  (value: string): FormFieldValidationResult => {
    const trimmed = value.trim();

    if (trimmed === "") {
      return {
        valid: false,
        value,
        errorMessages: [{ message: requiredMessage }],
      };
    }

    return {
      valid: true,
      value: trimmed,
      notifications:
        trimmed === value
          ? undefined
          : [{ notification: "Note: value has been trimmed" }],
    };
  };
