import type { FormValidationFnResult } from "@/hooks/useFormState";

export const validateOptionalTrimmedText = (
  value: string,
): FormValidationFnResult<string> => {
  const trimmed = value.trim();

  return {
    validatedValue: trimmed,
    notifications:
      trimmed === value ? [] : [{ message: "Note: value has been trimmed" }],
  };
};
