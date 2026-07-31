import { z } from "zod";

import { stringOrNonEmptyArraySchema } from "../common";

/** Allowed format keys (matches extract_cat_numbers_format_keys). */
const FORMAT_KEY_REGEX = /^(?:CD|DVD|BD|4HD_BD|3'CD|LP|TC)(?:[1-9]\d*)?$/;

const isFormatKey = (key: string): boolean => FORMAT_KEY_REGEX.test(key);

const INVALID_FORMAT_KEYS_EMPTY_MESSAGE =
  "Value is invalid — json object must have at least one key.";

const INVALID_FORMAT_KEYS_MIXED_MESSAGE =
  'Value is invalid — is a json object with format keys (like "CD", "DVD2" or "LP"), so no other keys are allowed.';

const INVALID_FORMAT_KEYS_NUMBERING_MESSAGE =
  "Value is invalid — format keys are numbered incorrectly. Every format must either be present as a single key without a number, or as keys numbered sequentially starting from 1.";

/** Mirrors `check_numbered_format_keys` postgres function */
const checkNumberedFormatKeys = (keys: string[]): boolean => {
  if (keys.length === 0) {
    return true;
  }

  const numbers = keys.map((k) => {
    const m = k.match(/(\d*)$/);

    return m?.[1] ?? "";
  });

  if (numbers.some((n) => n === "")) {
    return keys.length === 1;
  }

  if (numbers.every((n) => n !== "1")) {
    return false;
  }

  const max = Math.max(...numbers.map((n) => Number.parseInt(n, 10)));

  return max === numbers.length;
};

/** Mirrors `validate_format_keys` postgres function */
const validateFormatKeys = (formatKeys: string[]): boolean => {
  const keysByPrefix = formatKeys.reduce<Map<string, string[]>>(
    (buckets, key) => {
      const prefix = key.replace(/\d+$/, "");
      const bucket = buckets.get(prefix) ?? [];

      bucket.push(key);
      buckets.set(prefix, bucket);

      return buckets;
    },
    new Map(),
  );

  return keysByPrefix.values().every(checkNumberedFormatKeys);
};

const europeUkRegionsSchema = z.strictObject({
  "in Europe": stringOrNonEmptyArraySchema,
  "in UK": stringOrNonEmptyArraySchema,
});

const catNumbersNestedSchema = z.union([
  stringOrNonEmptyArraySchema,
  europeUkRegionsSchema,
]);

const catNumbersPropertySchema = z.union([
  stringOrNonEmptyArraySchema,
  europeUkRegionsSchema,
  z.strictObject({
    CD: catNumbersNestedSchema,
    slipcase: catNumbersNestedSchema,
  }),
]);

const labelField = { label: z.string() };
const labelsField = { labels: z.array(z.string()) };
const catNumberField = { cat_number: z.string() };
const catNumbersField = { cat_numbers: catNumbersPropertySchema };

const oneKeySchema = z.union([
  z.strictObject(labelField),
  z.strictObject(labelsField),
  z.strictObject(catNumberField),
  z.strictObject(catNumbersField),
]);

const twoKeysSchema = z.union([
  z.strictObject({ ...labelField, ...catNumberField }),
  z.strictObject({ ...labelField, ...catNumbersField }),
  z.strictObject({ ...labelsField, ...catNumberField }),
  z.strictObject({ ...labelsField, ...catNumbersField }),
]);

const releaseCatNumbersSingleSchema = z.union([oneKeySchema, twoKeysSchema]);

const standardCatNumbersObjSchema = z.union([
  releaseCatNumbersSingleSchema,
  z.array(releaseCatNumbersSingleSchema).nonempty(),
]);

const formatKeysCaseSchema = z
  .record(z.string(), standardCatNumbersObjSchema)
  .superRefine((obj, ctx) => {
    const keys = Object.keys(obj);
    const errorMessage =
      keys.length === 0
        ? INVALID_FORMAT_KEYS_EMPTY_MESSAGE
        : keys.some((k) => !isFormatKey(k))
          ? INVALID_FORMAT_KEYS_MIXED_MESSAGE
          : validateFormatKeys(keys)
            ? null
            : INVALID_FORMAT_KEYS_NUMBERING_MESSAGE;

    if (errorMessage) {
      ctx.addIssue({
        code: "custom",
        message: errorMessage,
      });
    }
  });

// See documentation/database/validation_functions/release_cat_numbers_jsonb_validation.md for documentation on the validation logic
export const releaseCatNumbersSchema = z.union([
  z.null(),
  formatKeysCaseSchema,
  standardCatNumbersObjSchema,
]);

export type ReleaseCatNumbers = z.infer<typeof releaseCatNumbersSchema>;
export type CatNumbersNested = z.infer<typeof catNumbersNestedSchema>;
export type CatNumbersProperty = z.infer<typeof catNumbersPropertySchema>;
export type ReleaseCatNumbersSingle = z.infer<
  typeof releaseCatNumbersSingleSchema
>;
export type ReleaseCatNumbersStandardKeysCase = z.infer<
  typeof standardCatNumbersObjSchema
>;
export type ReleaseCatNumbersFormatKeysCase = z.infer<
  typeof formatKeysCaseSchema
>;

export const isReleaseCatNumbersFormatKeysCase = (
  value: unknown,
): value is ReleaseCatNumbersFormatKeysCase =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  !("rawJson" in value && "error" in value) &&
  Object.keys(value).some(isFormatKey);
