import z from "zod";

import type { FormFieldValidationResult } from "@/types/form";

export const validateEntryDiscogsUrl = (
  value: string,
): FormFieldValidationResult => {
  const validationResult = entryDiscogsUrlSchema.safeParse(value);

  if (!validationResult.success) {
    return {
      valid: false,
      value,
      errorMessages: validationResult.error.issues.map(({ message }) => ({
        message,
      })),
    };
  }

  const validatedValue = validationResult.data;

  return {
    valid: true,
    value: validatedValue,
    notifications:
      validatedValue === value
        ? undefined
        : [{ notification: "Note: value has been trimmed" }],
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
