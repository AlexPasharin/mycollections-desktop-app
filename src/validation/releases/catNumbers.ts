import { z } from "zod";

import {
  atLeastOneStringSchema,
  nonEmptyStringArraySchema,
  nonEmptyStringSchema,
  checkSequentialStringsSuffixNumberingValidity,
} from "../common";

import { valueToArray } from "@/utils/common";

/** Allowed format keys (matches extract_cat_numbers_format_keys). */
const FORMAT_KEY_REGEX = /^(?:CD|DVD|BD|4HD_BD|3'CD|LP|TC)(?:[1-9]\d*)?$/;

const isFormatKey = (key: string): boolean => FORMAT_KEY_REGEX.test(key);

const EMPTY_OBJECT_ERROR_MESSAGE =
  "Value is invalid — json object must have at least one key.";

const INVALID_FORMAT_KEYS_MIXED_ERROR_MESSAGE =
  'Value is invalid — is a json object with format keys (like "CD", "DVD2" or "LP"), so no other keys are allowed.';

const INVALID_FORMAT_KEYS_NUMBERING_ERROR_MESSAGE =
  "Value is invalid — format keys are numbered incorrectly. Every format must either be present as a single key without a number, or as keys numbered sequentially starting from 1.";

const europeUkRegionsSchema = z.strictObject({
  "in Europe": atLeastOneStringSchema,
  "in UK": atLeastOneStringSchema,
});

const catNumbersSimplePropertySchema = z.union([
  z.array(nonEmptyStringSchema).nonempty(),
  europeUkRegionsSchema,
]);

const catNumberPropertySchema = nonEmptyStringSchema;

export type CatNumbersSimpleValue = z.infer<
  typeof catNumbersSimplePropertySchema
>;

const cdSlipcaseCatNumbersPropertySchema = z.strictObject({
  CD: z.union([catNumbersSimplePropertySchema, catNumberPropertySchema]),
  slipcase: z.union([catNumbersSimplePropertySchema, catNumberPropertySchema]),
});

const catNumbersPropertySchema = z.union([
  catNumbersSimplePropertySchema,
  cdSlipcaseCatNumbersPropertySchema,
]);

const labelField = { label: nonEmptyStringSchema };
const labelsField = { labels: nonEmptyStringArraySchema };
const catNumberField = { cat_number: catNumberPropertySchema };
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

const releaseCatNumbersStandardObjSchema = z.union([
  oneKeySchema,
  twoKeysSchema,
]);

const standardCatNumbersObjBareSchema = z.union([
  releaseCatNumbersStandardObjSchema,
  z.array(releaseCatNumbersStandardObjSchema).nonempty(),
]);

export type ReleaseCatNumbersStandardObj = (
  | {
      label?: string;
    }
  | {
      labels?: string[];
    }
) &
  (
    | {
        cat_number?: string;
      }
    | {
        cat_numbers?: CatNumbersSimpleValue;
      }
  );

export type ReleaseCatNumbersRepresentableAsRow =
  | ReleaseCatNumbersStandardObj
  | ReleaseCatNumbersStandardObj[];

type ReleaseCatNumbersStandardObjSchema =
  | {
      value: ReleaseCatNumbersRepresentableAsRow;
      type: "simple";
    }
  | {
      value: z.infer<typeof standardCatNumbersObjBareSchema>;
      type: "complex";
    };

const standardCatNumbersObjSchema = standardCatNumbersObjBareSchema.transform(
  (value): ReleaseCatNumbersStandardObjSchema => {
    const values = valueToArray(value);

    if (
      values.every(
        (val) => !("cat_numbers" in val) || !("CD" in val.cat_numbers),
      )
    ) {
      return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        value: value as ReleaseCatNumbersRepresentableAsRow, // assertion holds by the previous check
        type: "simple" as const,
      };
    }

    return {
      value,
      type: "complex" as const,
    };
  },
);

const extendedCatNumbersObjSchema = z
  .record(z.string(), standardCatNumbersObjBareSchema)
  .superRefine((obj, ctx) => {
    const keys = Object.keys(obj);

    if (keys.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: EMPTY_OBJECT_ERROR_MESSAGE,
      });
    }

    if (keys.some((k) => !isFormatKey(k))) {
      ctx.addIssue({
        code: "custom",
        message: INVALID_FORMAT_KEYS_MIXED_ERROR_MESSAGE,
      });
    }

    if (!validateFormatKeys(keys)) {
      ctx.addIssue({
        code: "custom",
        message: INVALID_FORMAT_KEYS_NUMBERING_ERROR_MESSAGE,
      });
    }
  })
  .transform((value) => ({ value, type: "complex" as const }));

/**
 * Mirrors `validate_format_keys` postgres function
 * Checks that all given format keys go through the sequential numbering check correctly when grouped by non-digit-tail prefix.
 */
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

  return keysByPrefix
    .values()
    .every(checkSequentialStringsSuffixNumberingValidity);
};

export const releaseCatNumbersSchema = z.union([
  z.null(),
  standardCatNumbersObjSchema,
  extendedCatNumbersObjSchema,
]);

export type ReleaseCatNumbers = z.infer<typeof releaseCatNumbersSchema>;

export type CatNumbersValue = z.infer<typeof catNumbersPropertySchema>;
