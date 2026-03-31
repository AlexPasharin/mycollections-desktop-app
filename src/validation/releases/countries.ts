import { z } from "zod";

import { stringOrNonEmptyArraySchema } from "../common";

const countriesObjectSchema = z.strictObject({
  "made in": stringOrNonEmptyArraySchema,
  "printed in": stringOrNonEmptyArraySchema,
});

const countriesBasicSchema = z.union([
  stringOrNonEmptyArraySchema,
  countriesObjectSchema,
]);

const slipcasePropertySchema = z.strictObject({
  "printed in": stringOrNonEmptyArraySchema,
});

// See documentation/database/validation_functions/release_countries_jsonb_validation.md for documentation on the validation logic
export const releaseCountriesSchema = z.union([
  z.null(),
  countriesBasicSchema,
  z.strictObject({
    CD: countriesBasicSchema,
    slipcase: slipcasePropertySchema,
  }),
]);

export type ReleaseCountries = z.infer<typeof releaseCountriesSchema>;

export type CountriesBasic = z.infer<typeof countriesBasicSchema>;
