import { z } from "zod";

import {
  emptyMutableCountriesSubsectionErrors,
  type ReleaseFormCountriesErrors,
} from "../errorMessages";
import type { ReleaseFormCountries } from "../formValues";

import type { FormFieldValidationResult } from "@/types/form";
import type { ValidationResultErrorMessages } from "@/utils/validation";
import { uniquePropertyArraySchema } from "@/validation";

export const validateReleaseCountries = (
  value: ReleaseFormCountries,
): FormFieldValidationResult<
  ReleaseFormCountries,
  ReleaseFormCountriesErrors
> => {
  const validationResult = countriesSchema.safeParse(value);

  if (!validationResult.success) {
    return {
      valid: false,
      value,
      errorMessages: getCountriesFormFieldErrors(
        validationResult.error.issues,
        value,
      ),
    };
  }

  const validatedValue = validationResult.data;

  return {
    valid: true,
    value: validatedValue,
  };
};

const madeInCountryCodeRowSchema = z.object({
  id: z.string(),
  codeName: z
    .string()
    .trim()
    .min(
      1,
      "Made-in country is required (or remove countries section all together)",
    ),
});

const printedInCountryCodeRowSchema = z.object({
  id: z.string(),
  codeName: z
    .string()
    .trim()
    .min(
      1,
      "Printed-in country is required (or remove printed-in countries section or the whole countries section all together)",
    ),
});

const madeInCountryCodesSchema = uniquePropertyArraySchema(
  madeInCountryCodeRowSchema,
  "Made-in countries must be unique",
  [""],
  "codeName",
);

const printedInCountryCodesSchema = uniquePropertyArraySchema(
  printedInCountryCodeRowSchema,
  "Printed-in countries must be unique",
  [""],
  "codeName",
);

const countriesSchema = z
  .object({
    madeIn: madeInCountryCodesSchema,
    printedIn: printedInCountryCodesSchema,
  })
  .refine((data) => data.printedIn.length === 0 || data.madeIn.length > 0, {
    message:
      "Add at least one made-in country when printed-in countries are set",
    path: ["madeIn"],
  });

const getCountriesFormFieldErrors = (
  errorMessages: ValidationResultErrorMessages,
  countries: ReleaseFormCountries,
): ReleaseFormCountriesErrors => {
  const madeIn = emptyMutableCountriesSubsectionErrors();
  const printedIn = emptyMutableCountriesSubsectionErrors();

  return errorMessages.reduce(
    (acc, { message, path }) => {
      const subsectionKey = path[0];

      if (subsectionKey !== "madeIn" && subsectionKey !== "printedIn") {
        return acc;
      }

      const target = acc[subsectionKey];

      const rowOrPropertyKey = path[1];

      if (typeof rowOrPropertyKey === "number") {
        const rows =
          subsectionKey === "madeIn" ? countries.madeIn : countries.printedIn;
        const row = rows[rowOrPropertyKey];

        if (!row) {
          return acc;
        }

        const rowSet =
          target.countrySelectErrorMessages[row.id] ?? new Set<string>();
        rowSet.add(message);
        target.countrySelectErrorMessages[row.id] = rowSet;
      } else {
        target.propertyErrorMessages.add(message);
      }

      return acc;
    },
    { madeIn, printedIn },
  );
};
