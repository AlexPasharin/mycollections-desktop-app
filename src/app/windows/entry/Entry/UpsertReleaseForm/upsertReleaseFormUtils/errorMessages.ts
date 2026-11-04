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

export type UpsertReleaseFormFormatInputFieldKey = {
  formatRowId: string;
  field: FormatField;
};

export type UpsertReleaseFormCatalogueNumbersInputFieldKey = {
  catNumberRowId: string;
  field: CatalogueNumbersInputField;
  inputValueId: string;
};

export type CountriesSubsection = "madeIn" | "printedIn";

export type UpsertReleaseFormCountriesInputFieldKey = {
  countriesSubsection: CountriesSubsection;
  rowId: string;
};

export type UpsertReleaseFormRelatedReleasesInputFieldKey = {
  relatedReleaseRowId: RelatedReleaseRowId;
};

export type UpsertReleaseFormInputFieldKey =
  | "releaseVersion"
  | "discogsUrl"
  | "comment"
  | "conditionProblems"
  | "catalogueNumbers"
  | "matrixRunout"
  | "relationToQueen"
  | ReleaseDateFieldErrorSource
  | UpsertReleaseFormFormatInputFieldKey
  | UpsertReleaseFormCatalogueNumbersInputFieldKey
  | UpsertReleaseFormCountriesInputFieldKey
  | UpsertReleaseFormRelatedReleasesInputFieldKey;

export const isFormatInputFieldKey = (key: UpsertReleaseFormInputFieldKey) =>
  typeof key === "object" && "formatRowId" in key;

export const isCatalogueNumbersInputFieldKey = (
  key: UpsertReleaseFormInputFieldKey,
) => typeof key === "object" && "catNumberRowId" in key;

export const isCountriesInputFieldKey = (key: UpsertReleaseFormInputFieldKey) =>
  typeof key === "object" && "countriesSubsection" in key;

export const isRelatedReleasesInputFieldKey = (
  key: UpsertReleaseFormInputFieldKey,
) => typeof key === "object" && "relatedReleaseRowId" in key;
