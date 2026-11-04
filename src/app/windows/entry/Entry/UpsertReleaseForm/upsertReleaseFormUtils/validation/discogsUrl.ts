import z from "zod";

import type {
  UpsertReleaseFormDraft,
  ValidatedUpsertReleaseFormDraft,
} from "../formValues/formState";

import type { FormValidationFn } from "@/types/form";

export const validateDiscogsUrl: FormValidationFn<
  UpsertReleaseFormDraft,
  ValidatedUpsertReleaseFormDraft,
  "discogsUrl"
> = (state) => {
  const value = state.discogsUrl.value;
  const trimmedValue = value.trim();
  const validationResult = discogsUrlSchema.safeParse(trimmedValue);

  const notifications =
    trimmedValue === value ? [] : [{ message: "Note: value has been trimmed" }];

  if (!validationResult.success) {
    return {
      value: trimmedValue,
      errors: validationResult.error.issues.map(({ message }) => ({
        message,
      })),
      notifications,
    };
  }

  const validatedValue = validationResult.data;

  return {
    validatedValue,
    notifications,
  };
};

// See documentation/database/tables/musical_releases_table.md
const discogsUrlPattern = /^https:\/\/www\.discogs\.com\/release\/\d+-./;

const discogsUrlSchema = z
  .string()
  .refine(
    (value) => value === "" || discogsUrlPattern.test(value),
    "Discogs URL must be of the form https://www.discogs.com/release/<numerical id>-<arbitrary text>",
  );
