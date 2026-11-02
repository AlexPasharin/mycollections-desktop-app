import type { FormValidationFnResult } from "@/hooks/useFormState";

export const validatePassThrough = <T>(
  value: T,
): FormValidationFnResult<T> => ({
  validatedValue: value,
  notifications: [],
});
