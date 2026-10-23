import type {
  ArtistUpsertFormDraft,
  ValidatedArtistUpsertFormDraft,
} from "../formValues";

import type { FormValidationFn } from "@/hooks/useFormState";

export const validateNameForSorting: FormValidationFn<
  ArtistUpsertFormDraft,
  ValidatedArtistUpsertFormDraft,
  "nameForSorting"
> = (state) => {
  const value = state.nameForSorting.value;
  const trimmed = value.trim();

  const notifications =
    trimmed === value ? [] : [{ message: "Note: value has been trimmed" }];

  const mainName = state.name.value.trim();

  if (mainName && mainName === trimmed) {
    return {
      value: trimmed,
      errors: [{ message: "Name for sorting cannot be the same as name" }],
      notifications,
    };
  }

  return {
    validatedValue: trimmed,
    notifications,
  };
};
