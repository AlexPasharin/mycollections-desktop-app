import { z } from "zod";

/**
 * Regex for a base-10 non-negative integer without useless leading zeros (single `0` allowed). No sign prefix.
 * Rejects scientific notation, decimals, `0x` hex, `Infinity`, etc.
 */
const BASE_TEN_INTEGER_STRING = /^(?:0|[1-9]\d*)$/;

/** validates that given string represents a safe non-negative integer. */
const strictStringToIntSchema = z
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
export const emptyStringToUndefinedSchema = z
  .literal("")
  .transform(() => undefined);

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

export const stringOrNonEmptyArraySchema = z.union([
  z.string(),
  z.array(z.string()).nonempty(),
]);
