import type { FormValidationFnResult } from "@/types/form";

export const validateOptionalTrimmedText = (
  value: string,
): FormValidationFnResult<string> => ({
  validatedValue: value.trim(),
  notifications:
    value.trim() === value ? [] : [{ message: "Note: value has been trimmed" }],
});
