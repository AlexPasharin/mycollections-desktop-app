import type { GeneralizedDateFormInputValue } from "@/app/components/GeneralizedDateFormInput";
import type { FormFieldError } from "@/types/form";
import { omitProperty } from "@/utils/common";

export type FormatField =
  | "formatId"
  | "amount"
  | "pictureSleeve"
  | "jukeboxHole";

type ReleaseDateFieldErrorSource = keyof GeneralizedDateFormInputValue;

export type FormatFieldsRowId = string;
export type CatNumberFieldsRowId = string;
type LabelInputId = string;
type CatNumberInputId = string;
type CountrySelectionRowId = string;

export type AddReleaseFormCatalogueNumberRowErrors = {
  labelInputErrorMessages: Record<LabelInputId, Set<string>>;
  catNumberInputErrorMessages: Record<CatNumberInputId, Set<string>>;
  europeCatNumberInputErrorMessages: Record<CatNumberInputId, Set<string>>;
  ukCatNumberInputErrorMessages: Record<CatNumberInputId, Set<string>>;
  rowErrorMessages: Set<string>;
};

export type AddReleaseFormCountriesSubsectionErrors = {
  countrySelectErrorMessages: Record<CountrySelectionRowId, Set<string>>;
  propertyErrorMessages: Set<string>;
};

export type AddReleaseFormCountriesErrors = {
  madeIn: AddReleaseFormCountriesSubsectionErrors;
  printedIn: AddReleaseFormCountriesSubsectionErrors;
};

export type AddReleaseFormFormatErrors = Record<
  FormatFieldsRowId,
  FormFieldError[]
>;

export type AddReleaseFormCatNumbersErrors = Record<
  CatNumberFieldsRowId,
  AddReleaseFormCatalogueNumberRowErrors
>;

export const emptyMutableCountriesSubsectionErrors =
  (): AddReleaseFormCountriesSubsectionErrors => ({
    countrySelectErrorMessages: {},
    propertyErrorMessages: new Set(),
  });

export const initialAddReleaseFormFieldErrors = {
  name: undefined,
  releaseVersion: [],
  discogsUrl: [],
  comment: undefined,
  conditionProblems: undefined,
  releaseDate: [],
  countries: {
    madeIn: emptyMutableCountriesSubsectionErrors(),
    printedIn: emptyMutableCountriesSubsectionErrors(),
  },
  formats: {},
  catalogueNumbers: {},
  matrixRunout: [],
  selectedTags: undefined,
  partOfQueenCollection: undefined,
  relationToQueen: undefined,
};

export type CatalogueNumbersInputField =
  | "label"
  | "catNumber"
  | "europeCatNumber"
  | "ukCatNumber";

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
  | "discogsUrl"
  | "comment"
  | "conditionProblems"
  | "matrixRunout"
  | "relationToQueen"
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

// Maps a per-input field key to the matching errors bucket on the row-errors
// object. Used by focus-handlers to clear the right bucket without each call
// site rebuilding the same conditional.
export const catalogueNumbersInputBucketKeyFor = (
  field: CatalogueNumbersInputField,
): keyof Pick<
  AddReleaseFormCatalogueNumberRowErrors,
  | "labelInputErrorMessages"
  | "catNumberInputErrorMessages"
  | "europeCatNumberInputErrorMessages"
  | "ukCatNumberInputErrorMessages"
> => {
  switch (field) {
    case "label":
      return "labelInputErrorMessages";
    case "catNumber":
      return "catNumberInputErrorMessages";
    case "europeCatNumber":
      return "europeCatNumberInputErrorMessages";
    case "ukCatNumber":
      return "ukCatNumberInputErrorMessages";
  }
};

export const isCountriesInputFieldKey = (key: AddReleaseFormInputFieldKey) =>
  typeof key === "object" && "countriesSubsection" in key;

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
