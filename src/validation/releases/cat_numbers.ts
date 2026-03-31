import { z } from "zod";

import { stringOrNonEmptyArraySchema } from "../common";

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
const labelsField = { labels: stringOrNonEmptyArraySchema };
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

// See documentation/database/validation_functions/release_cat_numbers_jsonb_validation.md for documentation on the validation logic
export const releaseCatNumbersSchema = z.union([
  z.null(),
  releaseCatNumbersSingleSchema,
  z.array(releaseCatNumbersSingleSchema),
]);

export type ReleaseCatNumbers = z.infer<typeof releaseCatNumbersSchema>;
