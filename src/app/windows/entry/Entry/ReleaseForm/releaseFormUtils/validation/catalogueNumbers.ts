import z from "zod";

import { validateReleaseCatNumbersJsonInput } from "./catalogueNumbersJsonInput";

import type {
  CatalogueNumberRowState,
  ReleaseFormCatNumbersDraft,
} from "../formValues";
import type {
  ReleaseFormDraft,
  ValidatedReleaseFormDraft,
} from "../formValues/formState";

import type {
  FormFeedbackMessages,
  FormValidationFn,
  FormValidationFnResult,
} from "@/hooks/useFormState";
import type { ValidationResultErrorMessages } from "@/utils/validation";
import { uniquePropertyArraySchema } from "@/validation";

export const validateReleaseCatNumbers: FormValidationFn<
  ReleaseFormDraft,
  ValidatedReleaseFormDraft,
  "catalogueNumbers"
> = (state) => {
  const value = state.catalogueNumbers.value;

  return value.activeTab === "json"
    ? validateReleaseCatNumbersJsonInput(value.value)
    : validateReleaseCatNumbersRows(value.rows);
};

const validateReleaseCatNumbersRows = (
  rows: CatalogueNumberRowState[],
): FormValidationFnResult<ReleaseFormCatNumbersDraft> => {
  const validationResult = catNumbersRowsSchema.safeParse(rows);

  if (!validationResult.success) {
    return {
      value: { rows, activeTab: "rows" },
      errors: getCatNumbersFeedbackMessages(
        validationResult.error.issues,
        rows,
      ),
      notifications: [],
    };
  }

  return {
    validatedValue: { rows: validationResult.data, activeTab: "rows" },
    notifications: [],
  };
};

// Each present input must carry a non-empty value: a row can opt out of a
// whole column (by having zero inputs in it), but an empty input slot inside
// a column is never valid — the user must either fill it in or remove it.
const labelInputValuesSchema = uniquePropertyArraySchema(
  z.object({
    id: z.string(),
    name: z.string().trim().min(1, "Fill in this label or remove the slot"),
  }),
  "Label names must be unique",
  [""],
  "name",
);

const catalogueNumberInputValuesSchema = uniquePropertyArraySchema(
  z.object({
    id: z.string(),
    value: z
      .string()
      .trim()
      .min(1, "Fill in this catalogue number or remove the slot"),
  }),
  "Catalogue number values must be unique",
  [""],
  "value",
);

// europeUk rows are stricter — the DB schema requires both regions to carry
// at least one non-empty value — so each input's value is required and each
// region's array must be non-empty.
const regionCatNumberInputValuesSchema = (
  requiredMessage: string,
  uniqueMessage: string,
) =>
  uniquePropertyArraySchema(
    z.object({
      id: z.string(),
      value: z.string().trim().min(1, requiredMessage),
    }),
    uniqueMessage,
    [""],
    "value",
  );

const europeCatNumberInputValuesSchema = regionCatNumberInputValuesSchema(
  'Fill in this "in Europe" catalogue number or remove the slot',
  '"In Europe" catalogue number values must be unique',
).min(1, '"In Europe" needs at least one catalogue number value');

const ukCatNumberInputValuesSchema = regionCatNumberInputValuesSchema(
  'Fill in this "in UK" catalogue number or remove the slot',
  '"In UK" catalogue number values must be unique',
).min(1, '"In UK" needs at least one catalogue number value');

const flatRowSchema = z
  .object({
    id: z.string(),
    shape: z.literal("flat"),
    labelInputValues: labelInputValuesSchema,
    catalogueNumberInputValues: catalogueNumberInputValuesSchema,
  })
  .refine(
    (row) =>
      row.labelInputValues.length + row.catalogueNumberInputValues.length >= 1,
    {
      message:
        "Each catalogue row needs at least one label or catalogue number field",
    },
  );

const europeUkRowSchema = z.object({
  id: z.string(),
  shape: z.literal("europeUk"),
  labelInputValues: labelInputValuesSchema,
  europeCatalogueNumberInputValues: europeCatNumberInputValuesSchema,
  ukCatalogueNumberInputValues: ukCatNumberInputValuesSchema,
});

const catalogueNumberRowSchema = z.discriminatedUnion("shape", [
  flatRowSchema,
  europeUkRowSchema,
]);

const catNumbersRowsSchema = z.array(catalogueNumberRowSchema);

const getCatNumbersFeedbackMessages = (
  errorMessages: ValidationResultErrorMessages,
  rows: CatalogueNumberRowState[],
): FormFeedbackMessages =>
  errorMessages.flatMap(({ message, path }) => {
    const rowIndex = path[0];
    const row = typeof rowIndex === "number" ? rows[rowIndex] : undefined;

    if (!row) {
      return [];
    }

    const [, fieldKey, inputIndex] = path;
    const inputId =
      typeof inputIndex === "number"
        ? inputsOnRow(row, fieldKey)?.[inputIndex]?.id
        : undefined;

    return [{ message, sources: inputId ? [row.id, inputId] : [row.id] }];
  });

const inputsOnRow = (
  row: CatalogueNumberRowState,
  fieldKey: PropertyKey | undefined,
) => {
  if (fieldKey === "labelInputValues") {
    return row.labelInputValues;
  }

  if (fieldKey === "catalogueNumberInputValues" && row.shape === "flat") {
    return row.catalogueNumberInputValues;
  }

  if (
    fieldKey === "europeCatalogueNumberInputValues" &&
    row.shape === "europeUk"
  ) {
    return row.europeCatalogueNumberInputValues;
  }

  if (fieldKey === "ukCatalogueNumberInputValues" && row.shape === "europeUk") {
    return row.ukCatalogueNumberInputValues;
  }

  return undefined;
};
