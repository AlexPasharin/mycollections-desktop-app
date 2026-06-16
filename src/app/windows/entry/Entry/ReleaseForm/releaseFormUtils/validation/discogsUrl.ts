import z from "zod";

import type { FormFieldValidationResult } from "@/types/form";

export const validateDiscogsUrl = (
  value: string,
): FormFieldValidationResult => {
  const validationResult = discogsUrlSchema.safeParse(value);

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

// See documentation/database/tables/musical_releases_table.md
const discogsUrlPattern = /^https:\/\/www\.discogs\.com\/release\/\d+-./;

const discogsUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || discogsUrlPattern.test(value),
    "Discogs URL must be of the form https://www.discogs.com/release/<numerical id>-<arbitrary text>",
  );
