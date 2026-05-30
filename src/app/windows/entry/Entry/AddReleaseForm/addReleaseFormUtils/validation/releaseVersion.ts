import z from "zod";

import type { FormFieldValidationResult } from "@/types/form";

import type { AddReleaseFormFieldError } from "../errorMessages";

export const validateReleaseVersion = (
  value: string,
): FormFieldValidationResult<string, AddReleaseFormFieldError[]> => {
  const validationResult = releaseVersionSchema.safeParse(value);

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

const releaseVersionSchema = z
  .string()
  .trim()
  .min(1, "Release version is required");
