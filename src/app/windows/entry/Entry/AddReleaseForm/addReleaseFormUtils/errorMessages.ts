import type { GeneralizedDateFormInputValue } from "@/app/components/GeneralizedDateFormInput";
import { omitProperty } from "@/utils/common";

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

export type FormatFieldsRowId = string;
export type CatNumberFieldsRowId = string;
type LabelInputId = string;
type CatNumberInputId = string;
type CountrySelectionRowId = string;

export type AddReleaseFormCatalogueNumberRowErrors = {
  labelInputErrorMessages: Record<LabelInputId, Set<string>>;
  catNumberInputErrorMessages: Record<CatNumberInputId, Set<string>>;
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
  AddReleaseFormFieldError[]
>;

export type AddReleaseFormCatNumbersErrors = Record<
  CatNumberFieldsRowId,
  AddReleaseFormCatalogueNumberRowErrors
>;

export type AddReleaseFormFieldErrors = {
  releaseVersion: AddReleaseFormFieldError[];
  discogsUrl: AddReleaseFormFieldError[];
  releaseDate: AddReleaseFormFieldError[];
  countries: AddReleaseFormCountriesErrors;
  formats: AddReleaseFormFormatErrors;
  catalogueNumbers: AddReleaseFormCatNumbersErrors;
  matrixRunout: AddReleaseFormFieldError[];
  selectedTags: undefined;
};

export const emptyMutableCountriesSubsectionErrors =
  (): AddReleaseFormCountriesSubsectionErrors => ({
    countrySelectErrorMessages: {},
    propertyErrorMessages: new Set(),
  });

export const initialAddReleaseFormFieldErrors: AddReleaseFormFieldErrors = {
  releaseVersion: [],
  discogsUrl: [],
  releaseDate: [],
  countries: {
    madeIn: emptyMutableCountriesSubsectionErrors(),
    printedIn: emptyMutableCountriesSubsectionErrors(),
  },
  formats: {},
  catalogueNumbers: {},
  matrixRunout: [],
  selectedTags: undefined,
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
  | "discogsUrl"
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
