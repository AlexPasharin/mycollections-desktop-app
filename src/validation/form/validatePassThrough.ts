import type { FormFieldValidationResult } from "@/types/form";

export const validatePassThrough = <T>(
  value: T,
): FormFieldValidationResult<T, never> => ({
  valid: true,
  value,
});
