import type {
  AddReleaseFormFormatInput,
  CatalogueNumberRowState,
} from "./formValues";

import type { GeneralizedDateFormInputValue } from "@/app/components/GeneralizedDateFormInput";
import { omitProperty } from "@/utils/common";
import {
  getFieldValidationErrorMessages,
  type ValidationResultErrorMessages,
} from "@/utils/validation";
import {
  catalogueNumberInputValuesSchema,
  labelInputValuesSchema,
} from "@/validation/releases/addReleaseForm/catNumbers";

export type FormatField =
  | "formatId"
  | "amount"
  | "pictureSleeve"
  | "jukeboxHole";

type ReleaseDateFieldErrorSource = keyof GeneralizedDateFormInputValue;

export type AddReleaseFormFieldError = {
  message: string;
  sources?: PropertyKey[] | undefined;
};

type FormatFieldsRowId = string;
type CatNumberFieldsRowId = string;
type LabelInputId = string;
type CatNumberInputId = string;
type CountrySelectionRowId = string;

export type AddReleaseFormCatalogueNumberRowErrors = {
  labelInputErrorMessages?: Record<LabelInputId, Set<string>> | undefined;
  catNumberInputErrorMessages?:
    | Record<CatNumberInputId, Set<string>>
    | undefined;
  rowErrorMessages?: Set<string> | undefined;
};

export type AddReleaseFormCountriesSubsectionErrors = {
  countrySelectErrorMessages: Record<CountrySelectionRowId, Set<string>>;
  propertyErrorMessages: Set<string>;
};

export type AddReleaseFormCountriesErrors = {
  madeIn: AddReleaseFormCountriesSubsectionErrors;
  printedIn: AddReleaseFormCountriesSubsectionErrors;
};

export type AddReleaseFormFieldErrors = {
  releaseVersion: AddReleaseFormFieldError[];
  releaseDate: AddReleaseFormFieldError[];
  countries: AddReleaseFormCountriesErrors;

  matrixRunout?: AddReleaseFormFieldError[] | undefined;
  formats?:
    | Record<FormatFieldsRowId, AddReleaseFormFieldError[] | undefined>
    | undefined;
  catalogueNumbers?:
    | Record<
        CatNumberFieldsRowId,
        AddReleaseFormCatalogueNumberRowErrors | undefined
      >
    | undefined;
};

export const emptyMutableCountriesSubsectionErrors =
  (): AddReleaseFormCountriesSubsectionErrors => ({
    countrySelectErrorMessages: {},
    propertyErrorMessages: new Set(),
  });

export const initialAddReleaseFormFieldErrors = {
  releaseVersion: [],
  releaseDate: [],
  countries: {
    madeIn: emptyMutableCountriesSubsectionErrors(),
    printedIn: emptyMutableCountriesSubsectionErrors(),
  },
};

export type CatalogueNumbersInputField = "label" | "catNumber";

export type AddReleaseFormFormatInputFieldKey = {
  formatRowId: string;
  field: FormatField;
};

export type AddReleaseFormCatalogueNumbersInputFieldKey = {
  catNumberRowId: string;
  field: CatalogueNumbersInputField;
  inputValueId: string;
};

export type CountriesSubsection = "madeIn" | "printedIn";

export type AddReleaseFormCountriesInputFieldKey = {
  countriesSubsection: CountriesSubsection;
  rowId: string;
};

export type AddReleaseFormInputFieldKey =
  | "releaseVersion"
  | "matrixRunout"
  | ReleaseDateFieldErrorSource
  | AddReleaseFormFormatInputFieldKey
  | AddReleaseFormCatalogueNumbersInputFieldKey
  | AddReleaseFormCountriesInputFieldKey;

export const isReleaseDateInputFieldKey = (key: AddReleaseFormInputFieldKey) =>
  key === "year" || key === "month" || key === "day";

export const isFormatInputFieldKey = (key: AddReleaseFormInputFieldKey) =>
  typeof key === "object" && "formatRowId" in key;

export const isCatalogueNumbersInputFieldKey = (
  key: AddReleaseFormInputFieldKey,
) => typeof key === "object" && "catNumberRowId" in key;

export const isCountriesInputFieldKey = (key: AddReleaseFormInputFieldKey) =>
  typeof key === "object" && "countriesSubsection" in key;

export const getFormatsFormFieldErrors = (
  errorMessages: ValidationResultErrorMessages,
  currentFormatInputValues: AddReleaseFormFormatInput[],
): AddReleaseFormFieldErrors["formats"] => {
  const errorMessagesMap: Record<
    FormatFieldsRowId,
    Record<string, PropertyKey[]>
  > = {};

  for (const { message, path } of errorMessages) {
    if (path[0] !== "formats") {
      continue;
    }

    const rowIndex = path[1];
    const source = path[2];

    const filterRowById =
      typeof rowIndex === "number"
        ? currentFormatInputValues[rowIndex]
        : undefined;

    if (!filterRowById) {
      continue;
    }

    const mapEntry = errorMessagesMap[filterRowById.id] ?? {};
    const messageEntry = mapEntry[message] ?? [];

    if (source) {
      messageEntry.push(source);
    }

    mapEntry[message] = messageEntry;
    errorMessagesMap[filterRowById.id] = mapEntry;
  }

  const formatsErrorMessages: Exclude<
    AddReleaseFormFieldErrors["formats"],
    undefined
  > = {};

  for (const [rowId, messages] of Object.entries(errorMessagesMap)) {
    formatsErrorMessages[rowId] = Object.entries(messages).map(
      ([message, sources]) => ({
        message,
        sources: sources.length > 0 ? sources : undefined,
      }),
    );
  }

  return formatsErrorMessages;
};

export const removeMadeInCountrySelectionRowFromFieldErrors = (
  countries: AddReleaseFormCountriesErrors,
  rowId: CountrySelectionRowId,
): AddReleaseFormCountriesErrors => {
  const madeIn = countries.madeIn;

  const selectMap = madeIn.countrySelectErrorMessages;

  if (!selectMap[rowId]) {
    return countries;
  }

  const nextMadeIn = {
    ...madeIn,
    countrySelectErrorMessages: omitProperty(selectMap, rowId),
  };

  return { madeIn: nextMadeIn, printedIn: countries.printedIn };
};

export const stripPrintedInFromCountriesFieldErrors = (
  countries: AddReleaseFormCountriesErrors,
): AddReleaseFormCountriesErrors => ({
  ...countries,
  printedIn: emptyMutableCountriesSubsectionErrors(),
});

export const getCaNumbersFormFieldErrors = (
  errorMessages: ValidationResultErrorMessages,
  currentCatalogueNumberInputValues: CatalogueNumberRowState[],
): AddReleaseFormFieldErrors["catalogueNumbers"] => {
  if (errorMessages.length === 0) {
    return undefined;
  }

  const errorMessagesMap: Record<
    CatNumberFieldsRowId,
    AddReleaseFormCatalogueNumberRowErrors
  > = {};

  for (const { message, path } of errorMessages) {
    if (path[0] !== "catalogueNumbers") {
      continue;
    }

    const rowIndex = path[1];

    // id of the catalogue number row that the error belongs to
    const catNumbersRowById =
      typeof rowIndex === "number"
        ? currentCatalogueNumberInputValues[rowIndex]
        : undefined;

    if (!catNumbersRowById) {
      continue;
    }

    const fieldKey = path[2];

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
    const rowErrorMessages = errorMessagesMap[catNumbersRowById.id] ?? {};

    if (fieldKey === "labelInputValues") {
      const labelInputIndex = path[3];

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
      const labelInputsErrorMessages =
        rowErrorMessages.labelInputErrorMessages ?? {};

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
      const catalogueNumberInputIndex = path[3];

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
        rowErrorMessages.catNumberInputErrorMessages ?? {};

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
      // error messages that belong to the row
      const rowCommonErrorMessages =
        rowErrorMessages.rowErrorMessages ?? new Set();
      rowCommonErrorMessages.add(message);

      rowErrorMessages.rowErrorMessages = rowCommonErrorMessages;
    }

    errorMessagesMap[catNumbersRowById.id] = rowErrorMessages;
  }

  return errorMessagesMap;
};

export type UpdateCatNumberFieldErrorsArgs = {
  catNumberRowId: string;
  fieldType: "label" | "catNumber";
};

export const updateCatNumberFieldErrors = (
  currentCatalogueNumberFieldInputValues: CatalogueNumberRowState[],
  currentCatNumberFieldErrors: AddReleaseFormFieldErrors["catalogueNumbers"],
  args: UpdateCatNumberFieldErrorsArgs,
): AddReleaseFormFieldErrors["catalogueNumbers"] => {
  const catNumberRow = currentCatalogueNumberFieldInputValues.find(
    (row) => row.id === args.catNumberRowId,
  );

  if (!catNumberRow) {
    return currentCatNumberFieldErrors;
  }

  const { catNumberRowId, fieldType } = args;

  const schema =
    fieldType === "label"
      ? labelInputValuesSchema
      : catalogueNumberInputValuesSchema;

  const value =
    fieldType === "label"
      ? catNumberRow.labelInputValues.map((label) => label.name)
      : catNumberRow.catalogueNumberInputValues.map((input) => input.value);

  const errorMessages = getFieldValidationErrorMessages(schema, value) ?? [];

  const nextFieldTypeErrors: Record<string, Set<string>> = {};

  const inputValues =
    fieldType === "label"
      ? catNumberRow.labelInputValues
      : catNumberRow.catalogueNumberInputValues;

  for (const { message, path } of errorMessages) {
    const idx = path[0];
    const inputId = typeof idx === "number" ? inputValues[idx]?.id : undefined;

    if (!inputId) {
      continue;
    }

    (nextFieldTypeErrors[inputId] ??= new Set()).add(message);
  }

  const errorsKey =
    fieldType === "label"
      ? "labelInputErrorMessages"
      : "catNumberInputErrorMessages";

  const nextRowErrors: AddReleaseFormCatalogueNumberRowErrors = {
    ...currentCatNumberFieldErrors?.[catNumberRowId],
    [errorsKey]:
      Object.keys(nextFieldTypeErrors).length > 0
        ? nextFieldTypeErrors
        : undefined,
  };

  const hasRowErrors =
    Object.keys(nextRowErrors.labelInputErrorMessages ?? {}).length > 0 ||
    Object.keys(nextRowErrors.catNumberInputErrorMessages ?? {}).length > 0 ||
    (nextRowErrors.rowErrorMessages?.size ?? 0) > 0;

  const restRows = omitProperty(
    currentCatNumberFieldErrors ?? {},
    catNumberRowId,
  );

  const nextCatalogueNumbers = hasRowErrors
    ? { ...restRows, [catNumberRowId]: nextRowErrors }
    : restRows;

  return Object.keys(nextCatalogueNumbers).length > 0
    ? nextCatalogueNumbers
    : undefined;
};
