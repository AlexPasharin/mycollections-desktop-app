import z from "zod";

import type { FormFieldValidationResult } from "./types";

import type { AddReleaseFormFieldError } from "../errorMessages";

export const validateDiscogsUrl = (
  value: string,
): FormFieldValidationResult<string, AddReleaseFormFieldError[]> => {
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
    "Discogs URL must start with https://www.discogs.com/release/<id>-",
  );
