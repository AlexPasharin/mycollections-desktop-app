import type { FormValidationFnResult } from "@/hooks/useFormState";
import type { FormFieldValidationResult } from "@/types/form";

export const validatePassThrough = <T>(
  value: T,
): FormFieldValidationResult<T, never> => ({
  valid: true,
  value,
});

export const validatePassThrough2 = <T>(
  value: T,
): FormValidationFnResult<T> => ({
  validatedValue: value,
  notifications: [],
});
