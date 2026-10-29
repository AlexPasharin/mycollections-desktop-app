import type { FormValidationFnResult } from "@/hooks/useFormState";
import type { FormFieldValidationResult } from "@/types/form";

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

export const validateOptionalTrimmedText2 = (
  value: string,
): FormValidationFnResult<string> => {
  const trimmed = value.trim();

  return {
    validatedValue: trimmed,
    notifications:
      trimmed === value ? [] : [{ message: "Note: value has been trimmed" }],
  };
};
