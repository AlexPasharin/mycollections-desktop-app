import type { FormValidationFnResult } from "@/hooks/useFormState";
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

export const validateRequiredTrimmedText2 = (
  value: string,
  requiredMessage: string,
): FormValidationFnResult<string> => {
  const trimmed = value.trim();

  if (trimmed === "") {
    return {
      value,
      notifications: [],
      errors: [{ message: requiredMessage }],
    };
  }

  const notifications =
    trimmed === value ? [] : [{ message: "Note: value has been trimmed" }];

  return {
    validatedValue: trimmed,
    notifications,
  };
};
