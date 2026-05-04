import { z } from "zod";

import type { FormFieldValidationResult } from "./types";

import type { AddReleaseFormFieldError } from "../errorMessages";
import type { AddReleaseFormMatrixRunoutDraft } from "../formValues";

import { releaseMatrixRunoutSchema } from "@/validation/releases/matrixRunout";

export const validateReleaseMatrixRunout = (
  value: AddReleaseFormMatrixRunoutDraft,
): FormFieldValidationResult<
  AddReleaseFormMatrixRunoutDraft,
  AddReleaseFormFieldError[]
> => {
  const validationResult = matrixRunoutSchema.safeParse(value);

  if (!validationResult.success) {
    return {
      valid: false,
      value,
      errorMessages: validationResult.error.issues.map(({ message }) => ({
        message,
      })),
    };
  }

  return {
    valid: true,
    value,
  };
};

const matrixRunoutSchema = z
  .object({
    value: z.string().trim(),
    treatAsText: z.boolean(),
  })
  .transform((input, ctx) => {
    const { value, treatAsText } = input;

    if (value === "") {
      return null;
    }

    if (treatAsText) {
      return value;
    }

    try {
      return JSON.parse(value) as unknown;
    } catch {
      ctx.addIssue({
        code: "custom",
        message:
          "Matrix / runout must be empty, plain text or valid JSON object. If you want it to be plain text, check the 'treat as plain text, not json object' checkbox.",
      });

      return z.NEVER;
    }
  })
  .pipe(releaseMatrixRunoutSchema);
