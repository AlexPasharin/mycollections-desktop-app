import { z } from "zod";

import { uniquePropertyArraySchema } from "@/validation/common";

const madeInCountryCodeRowSchema = z
  .string()
  .trim()
  .min(1, "Made-in country is required");

const printedInCountryCodeRowSchema = z
  .string()
  .trim()
  .min(1, "Printed-in country is required");

const madeInCountryCodesSchema = uniquePropertyArraySchema(
  madeInCountryCodeRowSchema,
  "Made-in countries must be unique",
);

const printedInCountryCodesSchema = uniquePropertyArraySchema(
  printedInCountryCodeRowSchema,
  "Printed-in countries must be unique",
);

export const addReleaseFormCountriesSchema = z
  .object({
    madeIn: madeInCountryCodesSchema,
    printedIn: printedInCountryCodesSchema,
  })
  .refine((data) => data.printedIn.length === 0 || data.madeIn.length > 0, {
    message:
      "Add at least one made-in country when printed-in countries are set",
    path: ["madeIn"],
  });
