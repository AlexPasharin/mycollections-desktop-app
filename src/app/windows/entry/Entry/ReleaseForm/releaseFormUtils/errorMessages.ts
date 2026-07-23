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

export type ReleaseFormCatalogueNumberRowErrors = {
  labelInputErrorMessages: Record<LabelInputId, Set<string>>;
  catNumberInputErrorMessages: Record<CatNumberInputId, Set<string>>;
  europeCatNumberInputErrorMessages: Record<CatNumberInputId, Set<string>>;
  ukCatNumberInputErrorMessages: Record<CatNumberInputId, Set<string>>;
  rowErrorMessages: Set<string>;
};

export type ReleaseFormCountriesSubsectionErrors = {
  countrySelectErrorMessages: Record<CountrySelectionRowId, Set<string>>;
  propertyErrorMessages: Set<string>;
};

export type ReleaseFormCountriesErrors = {
  madeIn: ReleaseFormCountriesSubsectionErrors;
  printedIn: ReleaseFormCountriesSubsectionErrors;
};

export type ReleaseFormFormatErrors = Record<
  FormatFieldsRowId,
  FormFieldError[]
>;

export type ReleaseFormCatNumbersErrors = Record<
  CatNumberFieldsRowId,
  ReleaseFormCatalogueNumberRowErrors
>;

export type RelatedReleaseRowId = string;

export type ReleaseFormRelatedReleasesErrors = Record<
  RelatedReleaseRowId,
  FormFieldError[]
>;

export const emptyMutableCountriesSubsectionErrors =
  (): ReleaseFormCountriesSubsectionErrors => ({
    countrySelectErrorMessages: {},
    propertyErrorMessages: new Set(),
  });

export const initialReleaseFormFieldErrors = {
  name: [],
  releaseVersion: [],
  discogsUrl: [],
  comment: [],
  conditionProblems: [],
  releaseDate: [],
  countries: {
    madeIn: emptyMutableCountriesSubsectionErrors(),
    printedIn: emptyMutableCountriesSubsectionErrors(),
  },
  formats: {},
  catalogueNumbers: {},
  matrixRunout: [],
  selectedTags: [],
  partOfQueenCollection: [],
  relationToQueen: [],
  relatedReleases: {},
  dbSources: [],
};

export type CatalogueNumbersInputField =
  | "label"
  | "catNumber"
  | "europeCatNumber"
  | "ukCatNumber";

export type ReleaseFormFormatInputFieldKey = {
  formatRowId: string;
  field: FormatField;
};

export type ReleaseFormCatalogueNumbersInputFieldKey = {
  catNumberRowId: string;
  field: CatalogueNumbersInputField;
  inputValueId: string;
};

export type CountriesSubsection = "madeIn" | "printedIn";

export type ReleaseFormCountriesInputFieldKey = {
  countriesSubsection: CountriesSubsection;
  rowId: string;
};

export type ReleaseFormRelatedReleasesInputFieldKey = {
  relatedReleaseRowId: RelatedReleaseRowId;
};

export type ReleaseFormInputFieldKey =
  | "releaseVersion"
  | "discogsUrl"
  | "comment"
  | "conditionProblems"
  | "matrixRunout"
  | "relationToQueen"
  | ReleaseDateFieldErrorSource
  | ReleaseFormFormatInputFieldKey
  | ReleaseFormCatalogueNumbersInputFieldKey
  | ReleaseFormCountriesInputFieldKey
  | ReleaseFormRelatedReleasesInputFieldKey;

export const isFormatInputFieldKey = (key: ReleaseFormInputFieldKey) =>
  typeof key === "object" && "formatRowId" in key;

export const isCatalogueNumbersInputFieldKey = (
  key: ReleaseFormInputFieldKey,
) => typeof key === "object" && "catNumberRowId" in key;

// Maps a per-input field key to the matching errors bucket on the row-errors
// object. Used by focus-handlers to clear the right bucket without each call
// site rebuilding the same conditional.
export const catalogueNumbersInputBucketKeyFor = (
  field: CatalogueNumbersInputField,
): keyof Pick<
  ReleaseFormCatalogueNumberRowErrors,
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

export const isCountriesInputFieldKey = (key: ReleaseFormInputFieldKey) =>
  typeof key === "object" && "countriesSubsection" in key;

export const isRelatedReleasesInputFieldKey = (key: ReleaseFormInputFieldKey) =>
  typeof key === "object" && "relatedReleaseRowId" in key;

export const removeMadeInCountrySelectionRowFromFieldErrors = (
  countries: ReleaseFormCountriesErrors,
  rowId: CountrySelectionRowId,
): ReleaseFormCountriesErrors => {
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
  countries: ReleaseFormCountriesErrors,
): ReleaseFormCountriesErrors => ({
  ...countries,
  printedIn: emptyMutableCountriesSubsectionErrors(),
});
