import type { FormField, FormFieldValidationResult } from "@/types/form";

export const validateNameForSorting = (
  value: string,
  form?: Record<string, FormField<unknown, unknown, unknown, unknown>>,
): FormFieldValidationResult<string> => {
  const trimmed = value.trim();

  const notifications =
    trimmed === value
      ? undefined
      : [{ notification: "Note: value has been trimmed" }];

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  if ((form?.["name"] as FormField<string>).value.trim() === trimmed) {
    return {
      valid: false,
      value: trimmed,
      errorMessages: [
        { message: "Name for sorting cannot be the same as name" },
      ],
      notifications,
    };
  }

  return {
    valid: true,
    value: trimmed,
    notifications,
  };
};
