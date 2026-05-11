import { parse as parseYaml } from "yaml";
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
    const prettified = JSON.stringify(parsed, null, 4);

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

    let parsed: unknown;

    try {
      // YAML requires whitespace after `:` to form a mapping (otherwise `CD:hello`
      // parses as the plain scalar `"CD:hello"`). For matrix/runout, the user
      // always wants colons to separate keys from values, so we normalize unquoted
      // colons before parsing. `failsafe` keeps every unquoted scalar as a string,
      // so tokens like `null`, `true`, `12345` stay as their literal form.
      parsed = parseYaml(ensureSpaceAfterColonOutsideQuotes(value), {
        schema: "failsafe",
      }) as unknown;
    } catch {
      ctx.addIssue({
        code: "custom",
        message:
          "Matrix / runout must be empty or a valid object (JSON or YAML-style; keys and string values may be unquoted). If you want it to be plain text, check the 'treat as plain text, not json object' checkbox.",
      });

      return z.NEVER;
    }

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

/**
 * Inserts a space after any `:` that is not already followed by whitespace,
 * unless that `:` occurs inside a single- or double-quoted YAML string. This
 * makes inputs like `CD:hello` or `{Side A:ABC,Side B:DEF}` parse as mappings.
 */
const ensureSpaceAfterColonOutsideQuotes = (input: string): string => {
  let out = "";
  let inDouble = false;
  let inSingle = false;
  let escapeNext = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input.charAt(i);

    if (escapeNext) {
      out += ch;
      escapeNext = false;
      continue;
    }

    if (inDouble && ch === "\\") {
      out += ch;
      escapeNext = true;
      continue;
    }

    if (!inSingle && ch === '"') {
      inDouble = !inDouble;
    } else if (!inDouble && ch === "'") {
      inSingle = !inSingle;
    }

    out += ch;

    if (ch === ":" && !inDouble && !inSingle) {
      const next = input.charAt(i + 1);

      if (next !== "" && !/\s/.test(next)) {
        out += " ";
      }
    }
  }

  return out;
};
