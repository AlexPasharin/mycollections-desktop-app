import type { FormValidationFnResult } from "@/types/form";

export const validateRequiredTrimmedText = (
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
