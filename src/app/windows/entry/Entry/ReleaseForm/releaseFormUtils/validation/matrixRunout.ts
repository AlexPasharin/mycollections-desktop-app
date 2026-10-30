import { z } from "zod";

import type {
  ReleaseFormDraft,
  ValidatedReleaseFormDraft,
} from "../formValues/formState";

import type {
  FormFeedbackMessages,
  FormValidationFn,
} from "@/hooks/useFormState";
import { formatJson } from "@/utils/common";
import { parseYAML } from "@/utils/parsing";
import { releaseMatrixRunoutSchema } from "@/validation";

export const validateReleaseMatrixRunout: FormValidationFn<
  ReleaseFormDraft,
  ValidatedReleaseFormDraft,
  "matrixRunout"
> = (state) => {
  const value = state.matrixRunout.value;

  // Step 1: parse the raw input (YAML → JS value, with required-object check).
  // We do this independently of the downstream structural validation so we can
  // pretty-print the JSON even when the structural rules ultimately reject it.
  const preResult = matrixRunoutInputSchema.safeParse(value);

  if (!preResult.success) {
    return {
      value,
      errors: preResult.error.issues.map(({ message }) => ({ message })),
      notifications: [],
    };
  }

  const parsed = preResult.data;
  const isJsonObject = parsed !== null && typeof parsed === "object";

  // Step 2: if the parsed value is an object, compute the pretty-printed form
  // and use it as the new textarea value (with a notification, if it changed).
  let formValue = value;
  let notifications: FormFeedbackMessages = [];

  if (isJsonObject) {
    const prettified = formatJson(parsed) ?? "";

    if (prettified !== value.value) {
      formValue = { ...value, value: prettified };
      notifications = [{ message: "Note: JSON value has been pretty-printed" }];
    }
  }

  // Step 3: run downstream structural validation. If it fails, surface those
  // errors while still keeping the prettified textarea value from step 2.
  const finalResult = releaseMatrixRunoutSchema.safeParse(parsed);

  if (!finalResult.success) {
    return {
      value: formValue,
      errors: finalResult.error.issues.map(({ message }) => ({ message })),
      notifications,
    };
  }

  return {
    validatedValue: formValue,
    notifications,
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
