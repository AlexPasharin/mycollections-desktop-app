import type { FormValidationFnResult } from "@/types/form";

export const validatePassThrough = <T>(
  value: T,
): FormValidationFnResult<T> => ({
  validatedValue: value,
  notifications: [],
});
