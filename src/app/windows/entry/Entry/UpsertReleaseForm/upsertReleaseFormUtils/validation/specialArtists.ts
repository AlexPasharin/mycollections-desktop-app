import type {
  UpsertReleaseFormDraft,
  ValidatedUpsertReleaseFormDraft,
} from "../formValues";

import type { FormValidationFn } from "@/types/form";
import { validateArtistAssociationRows } from "@/validation";

export const validateSpecialArtists: FormValidationFn<
  UpsertReleaseFormDraft,
  ValidatedUpsertReleaseFormDraft,
  "specialArtists"
> = (state) => {
  const { validatedRows, errors, notifications } =
    validateArtistAssociationRows(state.specialArtists.value);

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
