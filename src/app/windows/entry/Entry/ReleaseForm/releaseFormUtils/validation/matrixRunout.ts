import { z } from "zod";

import type { ReleaseFormMatrixRunoutDraft } from "../formValues";

import type { FormFieldValidationResult } from "@/types/form";
import { formatJson } from "@/utils/common";
import { parseYAML } from "@/utils/parsing";
import { releaseMatrixRunoutSchema } from "@/validation";

export const validateReleaseMatrixRunout = (
  value: ReleaseFormMatrixRunoutDraft,
): FormFieldValidationResult<ReleaseFormMatrixRunoutDraft> => {
  // Step 1: parse the raw input (YAML → JS value, with required-object check).
  // We do this independently of the downstream structural validation so we can
  // pretty-print the JSON even when the structural rules ultimately reject it.
  const preResult = matrixRunoutInputSchema.safeParse(value);

  if (!preResult.success) {
    return {
      valid: false,
      value,
      errorMessages: preResult.error.issues.map(({ message }) => ({
        message,
      })),
    };
  }

  const parsed = preResult.data;
  const isJsonObject = parsed !== null && typeof parsed === "object";

  // Step 2: if the parsed value is an object, compute the pretty-printed form
  // and use it as the new textarea value (with a notification, if it changed).
  let formValue = value;
  let prettifiedNotification: [{ notification: string }] | undefined;

  if (isJsonObject) {
    const prettified = formatJson(parsed) ?? "";

    if (prettified !== value.value) {
      formValue = { ...value, value: prettified };
      prettifiedNotification = [
        { notification: "Note: JSON value has been pretty-printed" },
      ];
    }
  }

  // Step 3: run downstream structural validation. If it fails, surface those
  // errors while still keeping the prettified textarea value from step 2.
  const finalResult = releaseMatrixRunoutSchema.safeParse(parsed);

  if (!finalResult.success) {
    return {
      valid: false,
      value: formValue,
      errorMessages: finalResult.error.issues.map(({ message }) => ({
        message,
      })),
      notifications: prettifiedNotification,
    };
  }

  return {
    valid: true,
    value: formValue,
    notifications: prettifiedNotification,
  };
};

const matrixRunoutInputSchema = z
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

    const yamlParsingResult = parseYAML(value);

    if (!yamlParsingResult) {
      ctx.addIssue({
        code: "custom",
        message:
          "Matrix / runout must be empty or a valid object (JSON or YAML-style; keys and string values may be unquoted). If you want it to be plain text, check the 'treat as plain text, not json object' checkbox.",
      });

      return z.NEVER;
    }

    const { parsed } = yamlParsingResult;

    if (parsed === null || typeof parsed !== "object") {
      ctx.addIssue({
        code: "custom",
        message:
          "Matrix / runout must parse as an object. If you want it to be plain text, check the 'treat as plain text, not json object' checkbox.",
      });

      return z.NEVER;
    }

    return parsed;
  });
