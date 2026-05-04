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

const labelInputValuesSchema = uniquePropertyArraySchema(
  z.object({
    id: z.string(),
    name: z
      .string()
      .trim()
      .min(
        1,
        "Label is required (or remove catalogue number section all together)",
      ),
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
      .min(
        1,
        "Value for catalogue number is required (or remove catalogue number section all together)",
      ),
  }),
  "Catalogue number values must be unique",
  [""],
  "value",
);

const catalogueNumberRowSchema = z
  .object({
    id: z.string(),
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

    const addReleaseFormCatalogueNumberRowErrorsKey:
      | keyof AddReleaseFormCatalogueNumberRowErrors
      | undefined =
      fieldKey === "labelInputValues"
        ? "labelInputErrorMessages"
        : fieldKey === "catalogueNumberInputValues"
          ? "catNumberInputErrorMessages"
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
    } else if (fieldKey === "catalogueNumberInputValues") {
      const catalogueNumberInputIndex = path[2];

      if (typeof catalogueNumberInputIndex !== "number") {
        continue;
      }

      const catalogueNumberInputId =
        catNumbersRowById.catalogueNumberInputValues[catalogueNumberInputIndex]
          ?.id;

      if (!catalogueNumberInputId) {
        continue;
      }

      // error messages that belong to row's catalogue number inputs
      const catNumberInputsErrorMessages =
        rowErrorMessages.catNumberInputErrorMessages;

      // error messages that belong to this particular catalogue number input
      const catNumberInputErrorMessages =
        catNumberInputsErrorMessages[catalogueNumberInputId] ?? new Set();

      catNumberInputErrorMessages.add(message);

      rowErrorMessages.catNumberInputErrorMessages = {
        ...catNumberInputsErrorMessages,
        [catalogueNumberInputId]: catNumberInputErrorMessages,
      };

      rowErrorMessages.catNumberInputErrorMessages[catalogueNumberInputId] =
        catNumberInputErrorMessages;
    } else {
      // error messages that belong to the whole row
      rowErrorMessages.rowErrorMessages.add(message);
    }

    errorMessagesMap[catNumbersRowById.id] = rowErrorMessages;
  }

  return errorMessagesMap;
};
