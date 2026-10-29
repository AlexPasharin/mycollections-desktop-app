import z from "zod";

import type {
  UpsertEntryFormDraft,
  ValidatedUpsertEntryFormDraft,
} from "../formValues";

import type { FormValidationFn } from "@/hooks/useFormState";

export const validateEntryDiscogsUrl: FormValidationFn<
  UpsertEntryFormDraft,
  ValidatedUpsertEntryFormDraft,
  "discogsUrl"
> = (state) => {
  const value = state.discogsUrl.value;
  const validationResult = entryDiscogsUrlSchema.safeParse(value);

  if (!validationResult.success) {
    const errors = validationResult.error.issues.map(({ message }) => ({
      message,
    }));

    return {
      value,
      errors,
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

const entryDiscogsUrlPattern =
  /^https:\/\/www\.discogs\.com\/(master|release)\/\d+-./;

const entryDiscogsUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || entryDiscogsUrlPattern.test(value),
    "Discogs URL must be of the form https://www.discogs.com/(master or release)/<numerical id>-<arbitrary text>",
  );
