import type {
  AddReleaseFormFormatInput,
  CountrySelectionInput,
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

export type AddReleaseFormCountriesErrors = {
  countrySelectErrorMessages?:
    | Record<CountrySelectionRowId, Set<string>>
    | undefined;
  propertyErrorMessages?: Set<string> | undefined;
};

export type AddReleaseFormFieldErrors = {
  releaseVersion?: AddReleaseFormFieldError[] | undefined;
  matrixRunout?: AddReleaseFormFieldError[] | undefined;
  releaseDate?: AddReleaseFormFieldError[] | undefined;
  formats?:
    | Record<FormatFieldsRowId, AddReleaseFormFieldError[] | undefined>
    | undefined;
  catalogueNumbers?:
    | Record<
        CatNumberFieldsRowId,
        AddReleaseFormCatalogueNumberRowErrors | undefined
      >
    | undefined;
  countries?:
    | {
        madeIn?: AddReleaseFormCountriesErrors | undefined;
        printedIn?: AddReleaseFormCountriesErrors | undefined;
      }
    | undefined;
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

export type AddReleaseFormInputFieldKey =
  | "releaseVersion"
  | "matrixRunout"
  | ReleaseDateFieldErrorSource
  | AddReleaseFormFormatInputFieldKey
  | AddReleaseFormCatalogueNumbersInputFieldKey;

export const isReleaseDateInputFieldKey = (key: AddReleaseFormInputFieldKey) =>
  key === "year" || key === "month" || key === "day";

export const isFormatInputFieldKey = (key: AddReleaseFormInputFieldKey) =>
  typeof key === "object" && "formatRowId" in key;

export const isCatalogueNumbersInputFieldKey = (
  key: AddReleaseFormInputFieldKey,
) => typeof key === "object" && "catNumberRowId" in key;

export const validationErrorsToFieldErrors = (
  errorMessages: ValidationResultErrorMessages,
  currentFormatInputValues: AddReleaseFormFormatInput[],
) => {
  const patch: AddReleaseFormFieldErrors = {};

  type ReleaseDateErrorMessage = string;
  const releaseDateErrorMessagesMap: Record<
    ReleaseDateErrorMessage,
    PropertyKey[]
  > = {};

  type FormatErrorMessage = string;
  const formatsErrorMessagesMap: Record<
    FormatFieldsRowId,
    Record<FormatErrorMessage, PropertyKey[]>
  > = {};

  for (const { message, path } of errorMessages) {
    const firstLevelKey = path[0];

    if (
      firstLevelKey === "releaseVersion" ||
      firstLevelKey === "matrixRunout"
    ) {
      const patchEntry = patch[firstLevelKey] ?? [];

      patchEntry.push({ message });
      patch[firstLevelKey] = patchEntry;
    } else if (firstLevelKey === "releaseDate") {
      const mapEntry = releaseDateErrorMessagesMap[message] ?? [];
      const source = path[1];

      if (source) {
        mapEntry.push(source);
      }

      releaseDateErrorMessagesMap[message] = mapEntry;
    } else if (firstLevelKey === "formats") {
      const rowIndex = path[1];

      const filterRowById =
        typeof rowIndex === "number"
          ? currentFormatInputValues[rowIndex]
          : undefined;

      if (!filterRowById) {
        continue;
      }

      const formatsRowErrorMessagesMap =
        formatsErrorMessagesMap[filterRowById.id] ?? {};
      const messageEntry = formatsRowErrorMessagesMap[message] ?? [];

      const source = path[2];

      if (source) {
        messageEntry.push(source);
      }

      formatsRowErrorMessagesMap[message] = messageEntry;
      formatsErrorMessagesMap[filterRowById.id] = formatsRowErrorMessagesMap;
    }
  }

  if (Object.keys(releaseDateErrorMessagesMap).length > 0) {
    patch.releaseDate = Object.entries(releaseDateErrorMessagesMap).map(
      ([message, sources]) => ({
        message,
        sources,
      }),
    );
  }

  if (Object.keys(formatsErrorMessagesMap).length > 0) {
    patch.formats = {};

    for (const [rowId, messages] of Object.entries(formatsErrorMessagesMap)) {
      patch.formats[rowId] = Object.entries(messages).map(
        ([message, sources]) => ({
          message,
          sources,
        }),
      );
    }
  }

  return patch;
};

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

export const getReleaseDateFormFieldErrors = (
  errorMessages: ValidationResultErrorMessages,
) => {
  const errorMessagesMap: Record<string, PropertyKey[]> = {};

  for (const { message, path } of errorMessages) {
    if (path[0] !== "releaseDate") {
      continue;
    }

    const mapEntry = errorMessagesMap[message] ?? [];
    const source = path[1];

    if (source) {
      mapEntry.push(source);
    }

    errorMessagesMap[message] = mapEntry;
  }

  return Object.entries(errorMessagesMap).map(([message, sources]) => ({
    message,
    sources: sources.length > 0 ? sources : undefined,
  }));
};

type MutableCountriesSubsectionErrors = {
  countrySelectErrorMessages: Record<CountrySelectionRowId, Set<string>>;
  propertyErrorMessages: Set<string>;
};

const emptyMutableCountriesSubsectionErrors =
  (): MutableCountriesSubsectionErrors => ({
    countrySelectErrorMessages: {},
    propertyErrorMessages: new Set(),
  });

const finalizeCountriesSubsectionErrors = (
  mutable: MutableCountriesSubsectionErrors,
): AddReleaseFormCountriesErrors | undefined => {
  const hasRowMessages =
    Object.keys(mutable.countrySelectErrorMessages).length > 0;
  const hasPropertyMessages = mutable.propertyErrorMessages.size > 0;

  if (!hasRowMessages && !hasPropertyMessages) {
    return undefined;
  }

  const result: AddReleaseFormCountriesErrors = {
    ...(hasRowMessages
      ? { countrySelectErrorMessages: mutable.countrySelectErrorMessages }
      : {}),
    ...(hasPropertyMessages
      ? { propertyErrorMessages: mutable.propertyErrorMessages }
      : {}),
  };

  return result;
};

export const getCountriesFormFieldErrors = (
  errorMessages: ValidationResultErrorMessages,
  madeInSelections: CountrySelectionInput[],
  printedInSelections: CountrySelectionInput[],
): AddReleaseFormFieldErrors["countries"] => {
  const madeInMutable = emptyMutableCountriesSubsectionErrors();
  const printedInMutable = emptyMutableCountriesSubsectionErrors();

  for (const { message, path } of errorMessages) {
    if (path[0] !== "countries") {
      continue;
    }

    const subsectionKey = path[1];

    if (subsectionKey !== "madeIn" && subsectionKey !== "printedIn") {
      continue;
    }

    const target =
      subsectionKey === "madeIn" ? madeInMutable : printedInMutable;
    const rowOrPropertyKey = path[2];

    if (typeof rowOrPropertyKey === "number") {
      const rows =
        subsectionKey === "madeIn" ? madeInSelections : printedInSelections;
      const row = rows[rowOrPropertyKey];

      if (!row) {
        continue;
      }

      const rowSet =
        target.countrySelectErrorMessages[row.id] ?? new Set<string>();
      rowSet.add(message);
      target.countrySelectErrorMessages[row.id] = rowSet;
    } else {
      target.propertyErrorMessages.add(message);
    }
  }

  const madeIn = finalizeCountriesSubsectionErrors(madeInMutable);
  const printedIn = finalizeCountriesSubsectionErrors(printedInMutable);

  const patch: NonNullable<AddReleaseFormFieldErrors["countries"]> = {
    ...(madeIn === undefined ? {} : { madeIn }),
    ...(printedIn === undefined ? {} : { printedIn }),
  };

  return Object.keys(patch).length > 0 ? patch : undefined;
};

export const removeMadeInCountrySelectionRowFromFieldErrors = (
  countries: AddReleaseFormFieldErrors["countries"],
  rowId: CountrySelectionRowId,
): AddReleaseFormFieldErrors["countries"] => {
  if (countries === undefined) {
    return undefined;
  }

  const madeIn = countries.madeIn;

  if (madeIn === undefined) {
    return countries;
  }

  const selectMap = madeIn.countrySelectErrorMessages;

  if (selectMap?.[rowId] === undefined) {
    return countries;
  }

  const restSelect = omitProperty(selectMap, rowId);

  const nextMadeIn = countriesSubsectionFromParts(
    Object.keys(restSelect).length > 0 ? restSelect : undefined,
    madeIn.propertyErrorMessages,
  );

  if (nextMadeIn === undefined && countries.printedIn === undefined) {
    return undefined;
  }

  return {
    ...(nextMadeIn === undefined ? {} : { madeIn: nextMadeIn }),
    ...(countries.printedIn === undefined
      ? {}
      : { printedIn: countries.printedIn }),
  };
};

export const stripPrintedInFromCountriesFieldErrors = (
  countries: AddReleaseFormFieldErrors["countries"],
): AddReleaseFormFieldErrors["countries"] => {
  if (!countries?.printedIn) {
    return countries;
  }

  const rest = omitProperty(countries, "printedIn");

  if (rest.madeIn === undefined) {
    return undefined;
  }

  return rest;
};

const countriesSubsectionFromParts = (
  countrySelectErrorMessages:
    | Record<CountrySelectionRowId, Set<string>>
    | undefined,
  propertyErrorMessages: Set<string> | undefined,
): AddReleaseFormCountriesErrors | undefined => {
  const hasSelect =
    countrySelectErrorMessages !== undefined &&
    Object.keys(countrySelectErrorMessages).length > 0;
  const hasProp =
    propertyErrorMessages !== undefined && propertyErrorMessages.size > 0;

  if (!hasSelect && !hasProp) {
    return undefined;
  }

  return {
    ...(hasSelect ? { countrySelectErrorMessages } : {}),
    ...(hasProp ? { propertyErrorMessages } : {}),
  };
};

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
