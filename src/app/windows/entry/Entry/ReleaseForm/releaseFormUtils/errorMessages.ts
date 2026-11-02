import type { GeneralizedDateFormInputValue } from "@/app/components/GeneralizedDateFormInput";

export type FormatField =
  | "formatId"
  | "amount"
  | "pictureSleeve"
  | "jukeboxHole";

type ReleaseDateFieldErrorSource = keyof GeneralizedDateFormInputValue;

export type FormatFieldsRowId = string;
export type CatNumberFieldsRowId = string;

export type RelatedReleaseRowId = string;

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
  | "catalogueNumbers"
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

export const isCountriesInputFieldKey = (key: ReleaseFormInputFieldKey) =>
  typeof key === "object" && "countriesSubsection" in key;

export const isRelatedReleasesInputFieldKey = (key: ReleaseFormInputFieldKey) =>
  typeof key === "object" && "relatedReleaseRowId" in key;
