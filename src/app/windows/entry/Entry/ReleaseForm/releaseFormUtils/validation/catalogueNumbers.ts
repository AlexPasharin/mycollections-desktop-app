import z from "zod";

import { validateReleaseCatNumbersJsonInput } from "./catalogueNumbersJsonInput";

import type {
  ReleaseFormCatalogueNumberRowErrors,
  ReleaseFormCatNumbersErrors,
  ReleaseFormCatNumbersFieldErrors,
  CatNumberFieldsRowId,
} from "../errorMessages";
import type {
  CatalogueNumberRowState,
  ReleaseFormCatNumbersDraft,
} from "../formValues";

import type { FormFieldValidationResult } from "@/types/form";
import type { ValidationResultErrorMessages } from "@/utils/validation";
import { uniquePropertyArraySchema } from "@/validation";

export const validateReleaseCatNumbers = (
  value: ReleaseFormCatNumbersDraft,
): FormFieldValidationResult<
  ReleaseFormCatNumbersDraft,
  ReleaseFormCatNumbersFieldErrors
> =>
  value.activeTab === "json"
    ? validateReleaseCatNumbersJsonInput(value.value)
    : validateReleaseCatNumbersRows(value.rows);

const validateReleaseCatNumbersRows = (
  value: CatalogueNumberRowState[],
): FormFieldValidationResult<
  ReleaseFormCatNumbersDraft,
  ReleaseFormCatNumbersFieldErrors
> => {
  const validationResult = catNumbersRowsSchema.safeParse(value);

  if (!validationResult.success) {
    const errorMessages = getCatNumbersFormFieldErrors(
      validationResult.error.issues,
      value,
    );

    return {
      valid: false,
      value: {
        rows: value,
        activeTab: "rows",
      },
      errorMessages: {
        rows: errorMessages,
        jsonInput: [],
      },
    };
  }

  return {
    valid: true,
    value: {
      rows: validationResult.data,
      activeTab: "rows",
    },
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

const getCatNumbersFormFieldErrors = (
  errorMessages: ValidationResultErrorMessages,
  currentCatalogueNumberInputValues: CatalogueNumberRowState[],
): ReleaseFormCatNumbersErrors => {
  if (errorMessages.length === 0) {
    return {};
  }

  const errorMessagesMap: Record<
    CatNumberFieldsRowId,
    ReleaseFormCatalogueNumberRowErrors
  > = {};

  for (const { message, path } of errorMessages) {
    const rowIndex = path[0];

    // id of the catalogue number row that the error belongs to
    const catNumbersRowById =
      typeof rowIndex === "number"
        ? currentCatalogueNumberInputValues[rowIndex]
        : undefined;

    if (!catNumbersRowById) {
      // should never happen
      continue;
    }

    const fieldKey = path[1];

    // entry for the catalogue number row that the error belongs to
    let rowErrorMessages: ReleaseFormCatalogueNumberRowErrors =
      errorMessagesMap[catNumbersRowById.id] ?? {
        labelInputErrorMessages: {},
        catNumberInputErrorMessages: {},
        europeCatNumberInputErrorMessages: {},
        ukCatNumberInputErrorMessages: {},
        rowErrorMessages: new Set(),
      };

    if (fieldKey === "labelInputValues") {
      const labelInputIndex = path[2];

      // id of the label input that the error belongs to
      const labelInputId =
        typeof labelInputIndex === "number"
          ? catNumbersRowById.labelInputValues[labelInputIndex]?.id
          : undefined;

      if (!labelInputId) {
        rowErrorMessages.rowErrorMessages.add(message);

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
    } else {
      const inputValueBucket = catNumberInputValueBucketFor(fieldKey);

      if (!inputValueBucket) {
        rowErrorMessages.rowErrorMessages.add(message);

        continue;
      }

      const inputsOnRow = inputValueBucket.readInputs(catNumbersRowById);
      const catalogueNumberInputIndex = path[2];

      const catalogueNumberInputId =
        typeof catalogueNumberInputIndex === "number"
          ? inputsOnRow?.[catalogueNumberInputIndex]?.id
          : undefined;

      if (!catalogueNumberInputId) {
        // should never happen
        rowErrorMessages.rowErrorMessages.add(message);

        continue;
      }

      rowErrorMessages = addInputErrorToBucket(
        rowErrorMessages,
        inputValueBucket.errorMessagesKey,
        catalogueNumberInputId,
        message,
      );
    }

    errorMessagesMap[catNumbersRowById.id] = rowErrorMessages;
  }

  return errorMessagesMap;
};

type CatNumberInputErrorMessagesKey = keyof Pick<
  ReleaseFormCatalogueNumberRowErrors,
  | "catNumberInputErrorMessages"
  | "europeCatNumberInputErrorMessages"
  | "ukCatNumberInputErrorMessages"
>;

type CatNumberInputValueBucket = {
  errorMessagesKey: CatNumberInputErrorMessagesKey;
  readInputs: (
    row: CatalogueNumberRowState,
  ) => { id: string; value: string }[] | undefined;
};

const addInputErrorToBucket = (
  rowErrors: ReleaseFormCatalogueNumberRowErrors,
  bucketKey: CatNumberInputErrorMessagesKey,
  inputId: string,
  message: string,
): ReleaseFormCatalogueNumberRowErrors => {
  rowErrors[bucketKey] = withInputMessage(
    rowErrors[bucketKey],
    inputId,
    message,
  );

  return rowErrors;
};

const withInputMessage = (
  bucket: Record<string, Set<string>>,
  inputId: string,
  message: string,
): Record<string, Set<string>> => {
  const set = bucket[inputId] ?? new Set<string>();
  set.add(message);

  return {
    ...bucket,
    [inputId]: set,
  };
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
