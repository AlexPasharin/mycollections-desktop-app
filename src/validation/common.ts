import { z } from "zod";

import { duplicateIndicesByKey } from "@/utils/common";
import { addCustomValidationIssues } from "@/utils/validation";

/**
 * `z.array(itemSchema)` where duplicate values at `fieldKey` are invalid
 * (same index rule as {@link duplicateIndicesByKey}); issues at `[index, fieldKey]`.
 */
export const uniquePropertyArraySchema = <TItem extends z.ZodType>(
  itemSchema: TItem,
  validationErrorMessage: string,
  ignoreValues: unknown[] = [],
  fieldKey?: keyof z.infer<TItem> & PropertyKey,
): z.ZodArray<TItem> =>
  z.array(itemSchema).superRefine((arr, ctx) => {
    const paths = duplicateIndicesByKey(arr, ignoreValues, fieldKey).map((i) =>
      fieldKey ? [i, fieldKey] : [i],
    );

    if (paths.length > 0) {
      addCustomValidationIssues(ctx, validationErrorMessage, ...paths);
    }
  });

/**
 * Regex for a base-10 non-negative integer without useless leading zeros (single `0` allowed). No sign prefix.
 * Rejects scientific notation, decimals, `0x` hex, `Infinity`, etc.
 */
const BASE_TEN_INTEGER_STRING = /^(?:0|[1-9]\d*)$/;

/** validates that given string represents a safe non-negative integer. */
export const strictStringToIntSchema = z
  .string()
  .regex(BASE_TEN_INTEGER_STRING, {
    message:
      "Expected a base-10 integer string (no sign prefix, no decimals or scientific notation).",
  })
  .transform((s) => Number(s))
  .refine((n) => Number.isSafeInteger(n), {
    message: "Integer is outside the safe integer range.",
  });

// schema that transforms an empty string into undefined.
const emptyStringToUndefinedSchema = z.literal("").transform(() => undefined);

const stringToIntSchema = z
  .string()
  .trim()
  .pipe(z.union([emptyStringToUndefinedSchema, strictStringToIntSchema]));

/** Schema that accepts a non-negative integer represented by a number or string, or undefined
 * Output is `number | undefined`.
 * `undefined`, `""`, and whitespace-only strings transform to `undefined`.
 */
export const coercedIntSchema = z.union([
  z.int().nonnegative(),
  z.undefined(),
  stringToIntSchema,
]);

export const nonEmptyStringSchema = z
  .string()
  .trim()
  .min(1, "Must be a non-empty string");

export const nonEmptyStringArraySchema = z
  .array(nonEmptyStringSchema)
  .nonempty();

export const atLeastOneStringSchema = z.union([
  nonEmptyStringSchema,
  nonEmptyStringArraySchema,
]);

export const errorSetToMessages = (set?: Set<string>) =>
  set && set.size > 0 ? Array.from(set, (message) => ({ message })) : undefined;

/** Mirrors `check_numbered_format_keys` postgres function
 * Checks if the given array of strings represents a valid numbering with respect to number suffixes.
 * A valid numbering is either a single string without a numeric suffix (e.g. ["CD"]),
 * or a sequence of two or more strings whose trailing digits run 1..n with no gaps (e.g. ["CD1", "CD2"]).
 * Use case example: ["CD1", "CD2", "CD3"] is valid; ["CD1"] alone is not.
 */
export const checkSequentialStringsSuffixNumberingValidity = (
  strs: string[],
): boolean => {
  if (strs.length === 0) {
    return true;
  }

  const numbers = strs.map((k) => {
    const m = k.match(/(\d+)$/); // extract the longest suffix with digits only, if exists

    return m?.[1] ?? "";
  });

  // if there is only one string, it must not have a numeric suffix
  if (strs.length === 1) {
    return numbers[0] === "";
  }

  // otherwise all strings must have a numeric suffix
  if (numbers.some((n) => n === "")) {
    return false;
  }

  // one of the suffixes must be 1
  if (numbers.every((n) => n !== "1")) {
    return false;
  }

  // all suffixes must be sequential, starting from 1
  const max = Math.max(...numbers.map((n) => Number.parseInt(n, 10)));

  return max === numbers.length;
};
