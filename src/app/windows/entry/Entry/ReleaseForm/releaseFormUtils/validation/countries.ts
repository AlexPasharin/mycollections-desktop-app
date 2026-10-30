import { z } from "zod";

import type { ReleaseFormCountries } from "../formValues/countries";
import type {
  ReleaseFormDraft,
  ValidatedReleaseFormDraft,
} from "../formValues/formState";

import type {
  FormValidationFn,
  FormFeedbackMessages,
} from "@/hooks/useFormState";
import type { ValidationResultErrorMessages } from "@/utils/validation";
import { uniquePropertyArraySchema } from "@/validation";

export const validateReleaseCountries: FormValidationFn<
  ReleaseFormDraft,
  ValidatedReleaseFormDraft,
  "countries"
> = (state) => {
  const value = state.countries.value;
  const validationResult = countriesSchema.safeParse(value);

  if (!validationResult.success) {
    return {
      value,
      errors: getCountriesFeedbackMessages(
        validationResult.error.issues,
        value,
      ),
      notifications: [],
    };
  }

  return {
    validatedValue: validationResult.data,
    notifications: [],
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

const getCountriesFeedbackMessages = (
  errorMessages: ValidationResultErrorMessages,
  countries: ReleaseFormCountries,
): FormFeedbackMessages =>
  errorMessages.flatMap(({ message, path }) => {
    const subsection = path[0];

    if (subsection !== "madeIn" && subsection !== "printedIn") {
      return [];
    }

    const rowIndex = path[1];
    const row =
      typeof rowIndex === "number"
        ? countries[subsection][rowIndex]
        : undefined;

    return [
      {
        message,
        sources: row ? [row.id, "codeName"] : [subsection],
      },
    ];
  });
