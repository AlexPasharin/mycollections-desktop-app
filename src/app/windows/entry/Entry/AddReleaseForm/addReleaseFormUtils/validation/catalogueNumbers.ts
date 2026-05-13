import z from "zod";

import type { FormFieldValidationResult } from "./types";

import type {
  AddReleaseFormCatalogueNumberRowErrors,
  AddReleaseFormCatNumbersErrors,
  CatNumberFieldsRowId,
} from "../errorMessages";
import type { AddReleaseFormCatNumbersInputs } from "../formValues";

import type { ValidationResultErrorMessages } from "@/utils/validation";
import { uniquePropertyArraySchema } from "@/validation/common";

export const validateReleaseCatNumbers = (
  value: AddReleaseFormCatNumbersInputs,
): FormFieldValidationResult<
  AddReleaseFormCatNumbersInputs,
  AddReleaseFormCatNumbersErrors
> => {
  const validationResult = catNumbersSchema.safeParse(value);

  if (!validationResult.success) {
    const errorMessages = getCatNumbersFormFieldErrors(
      validationResult.error.issues,
      value,
    );

    return {
      valid: false,
      value,
      errorMessages,
    };
  }

  return {
    valid: true,
    value,
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

const catNumbersSchema = z.array(catalogueNumberRowSchema).optional();

const getCatNumbersFormFieldErrors = (
  errorMessages: ValidationResultErrorMessages,
  currentCatalogueNumberInputValues: AddReleaseFormCatNumbersInputs,
): AddReleaseFormCatNumbersErrors => {
  if (errorMessages.length === 0) {
    return {};
  }

  const errorMessagesMap: Record<
    CatNumberFieldsRowId,
    AddReleaseFormCatalogueNumberRowErrors
  > = {};

  for (const { message, path } of errorMessages) {
    const rowIndex = path[0];

    // id of the catalogue number row that the error belongs to
    const catNumbersRowById =
      typeof rowIndex === "number"
        ? currentCatalogueNumberInputValues[rowIndex]
        : undefined;

    if (!catNumbersRowById) {
      continue;
    }

    const fieldKey = path[1];

    const inputValueBucket = catNumberInputValueBucketFor(fieldKey);

    const addReleaseFormCatalogueNumberRowErrorsKey:
      | keyof AddReleaseFormCatalogueNumberRowErrors
      | undefined =
      fieldKey === "labelInputValues"
        ? "labelInputErrorMessages"
        : inputValueBucket
          ? inputValueBucket.errorMessagesKey
          : fieldKey === undefined
            ? "rowErrorMessages"
            : undefined;

    if (!addReleaseFormCatalogueNumberRowErrorsKey) {
      continue;
    }

    // entry for the catalogue number row that the error belongs to
    const rowErrorMessages: AddReleaseFormCatalogueNumberRowErrors =
      errorMessagesMap[catNumbersRowById.id] ?? {
        labelInputErrorMessages: {},
        catNumberInputErrorMessages: {},
        europeCatNumberInputErrorMessages: {},
        ukCatNumberInputErrorMessages: {},
        rowErrorMessages: new Set(),
      };

    if (fieldKey === "labelInputValues") {
      const labelInputIndex = path[2];

      if (typeof labelInputIndex !== "number") {
        continue;
      }

      // id of the label input that the error belongs to
      const labelInputId =
        catNumbersRowById.labelInputValues[labelInputIndex]?.id;

      if (!labelInputId) {
        continue;
      }

      // error messages that belong to row's label inputs
      const labelInputsErrorMessages = rowErrorMessages.labelInputErrorMessages;

      // error messages that belong to this particular label input
      const labelInputErrorMessages =
        labelInputsErrorMessages[labelInputId] ?? new Set();

      labelInputErrorMessages.add(message);

      rowErrorMessages.labelInputErrorMessages = {
        ...labelInputsErrorMessages,
        [labelInputId]: labelInputErrorMessages,
      };

      rowErrorMessages.labelInputErrorMessages[labelInputId] =
        labelInputErrorMessages;
    } else if (inputValueBucket) {
      const catalogueNumberInputIndex = path[2];

      if (typeof catalogueNumberInputIndex !== "number") {
        continue;
      }

      const inputsOnRow = inputValueBucket.readInputs(catNumbersRowById);
      const catalogueNumberInputId =
        inputsOnRow?.[catalogueNumberInputIndex]?.id;

      if (!catalogueNumberInputId) {
        continue;
      }

      addInputErrorToBucket(
        rowErrorMessages,
        inputValueBucket.errorMessagesKey,
        catalogueNumberInputId,
        message,
      );
    } else {
      // error messages that belong to the whole row
      rowErrorMessages.rowErrorMessages.add(message);
    }

    errorMessagesMap[catNumbersRowById.id] = rowErrorMessages;
  }

  return errorMessagesMap;
};

// Maps the zod path head for the cat-number side of a row to the row-state
// array it points at and the matching row-errors bucket.
type CatNumberInputErrorMessagesKey = keyof Pick<
  AddReleaseFormCatalogueNumberRowErrors,
  | "catNumberInputErrorMessages"
  | "europeCatNumberInputErrorMessages"
  | "ukCatNumberInputErrorMessages"
>;

type CatNumberInputValueBucket = {
  errorMessagesKey: CatNumberInputErrorMessagesKey;
  readInputs: (
    row: AddReleaseFormCatNumbersInputs[number],
  ) => { id: string; value: string }[] | undefined;
};

const addInputErrorToBucket = (
  rowErrors: AddReleaseFormCatalogueNumberRowErrors,
  bucketKey: CatNumberInputErrorMessagesKey,
  inputId: string,
  message: string,
) => {
  switch (bucketKey) {
    case "catNumberInputErrorMessages":
      rowErrors.catNumberInputErrorMessages = withInputMessage(
        rowErrors.catNumberInputErrorMessages,
        inputId,
        message,
      );

      return;
    case "europeCatNumberInputErrorMessages":
      rowErrors.europeCatNumberInputErrorMessages = withInputMessage(
        rowErrors.europeCatNumberInputErrorMessages,
        inputId,
        message,
      );

      return;
    case "ukCatNumberInputErrorMessages":
      rowErrors.ukCatNumberInputErrorMessages = withInputMessage(
        rowErrors.ukCatNumberInputErrorMessages,
        inputId,
        message,
      );
  }
};

const withInputMessage = (
  bucket: Record<string, Set<string>>,
  inputId: string,
  message: string,
): Record<string, Set<string>> => {
  const set = bucket[inputId] ?? new Set<string>();
  set.add(message);

  return { ...bucket, [inputId]: set };
};

const catNumberInputValueBucketFor = (
  fieldKey: PropertyKey | undefined,
): CatNumberInputValueBucket | undefined => {
  if (fieldKey === "catalogueNumberInputValues") {
    return {
      errorMessagesKey: "catNumberInputErrorMessages",
      readInputs: (row) =>
        row.shape === "flat" ? row.catalogueNumberInputValues : undefined,
    };
  }

  if (fieldKey === "europeCatalogueNumberInputValues") {
    return {
      errorMessagesKey: "europeCatNumberInputErrorMessages",
      readInputs: (row) =>
        row.shape === "europeUk"
          ? row.europeCatalogueNumberInputValues
          : undefined,
    };
  }

  if (fieldKey === "ukCatalogueNumberInputValues") {
    return {
      errorMessagesKey: "ukCatNumberInputErrorMessages",
      readInputs: (row) =>
        row.shape === "europeUk" ? row.ukCatalogueNumberInputValues : undefined,
    };
  }

  return undefined;
};
