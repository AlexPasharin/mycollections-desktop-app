import z from "zod";

import type {
  ReleaseFormDraft,
  ValidatedReleaseFormDraft,
} from "../formValues/formState";

import type { FormValidationFn } from "@/hooks/useFormState";

export const validateDiscogsUrl: FormValidationFn<
  ReleaseFormDraft,
  ValidatedReleaseFormDraft,
  "discogsUrl"
> = (state) => {
  const value = state.discogsUrl.value;
  const validationResult = discogsUrlSchema.safeParse(value);

  if (!validationResult.success) {
    return {
      value,
      errors: validationResult.error.issues.map(({ message }) => ({
        message,
      })),
      notifications: [],
    };
  }

  const validatedValue = validationResult.data;

  return {
    validatedValue,
    notifications:
      validatedValue === value
        ? []
        : [{ message: "Note: value has been trimmed" }],
  };
};

// See documentation/database/tables/musical_releases_table.md
const discogsUrlPattern = /^https:\/\/www\.discogs\.com\/release\/\d+-./;

const discogsUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || discogsUrlPattern.test(value),
    "Discogs URL must be of the form https://www.discogs.com/release/<numerical id>-<arbitrary text>",
  );
