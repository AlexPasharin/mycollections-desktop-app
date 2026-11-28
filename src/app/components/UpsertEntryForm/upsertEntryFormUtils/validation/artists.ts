import type {
  UpsertEntryFormDraft,
  ValidatedUpsertEntryFormDraft,
} from "../formValues";

import type { FormValidationFn } from "@/types/form";
import { validateArtistAssociationRows } from "@/validation";

export const validateArtists: FormValidationFn<
  UpsertEntryFormDraft,
  ValidatedUpsertEntryFormDraft,
  "artists"
> = (state) => {
  const { validatedRows, errors, notifications } =
    validateArtistAssociationRows(state.artists.value);

  if (errors.length > 0) {
    return {
      value: validatedRows,
      errors,
      notifications,
    };
  }

  return {
    validatedValue: validatedRows,
    notifications,
  };
};
