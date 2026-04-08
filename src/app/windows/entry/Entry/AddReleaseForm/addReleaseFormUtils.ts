import type { AddReleaseFormFormatInput } from "./AddReleaseFormFormatsSection/index";

import type { GeneralizedDateFormInputValue } from "@/app/components/GeneralizedDateFormInput";

export type ReleaseDateFieldErrorSource = keyof GeneralizedDateFormInputValue;

export type FormatFieldErrorSource =
  | "format"
  | "amount"
  | "pictureSleeve"
  | "jukeboxHole";

export type DraftFieldError<Source = undefined> = {
  message: string;
  source?: Source;
};

export type FieldErrorsDict = {
  releaseVersion?: DraftFieldError;
  releaseDate?: DraftFieldError<ReleaseDateFieldErrorSource>;
  formats?: DraftFieldError<FormatFieldErrorSource>;
};

export type FieldValidationKey =
  | keyof FieldErrorsDict
  | ReleaseDateFieldErrorSource
  | FormatFieldErrorSource;

export const isReleaseDateFieldValidationKey = (
  key: FieldValidationKey,
): key is ReleaseDateFieldErrorSource =>
  key === "year" || key === "month" || key === "day";

export const isFormatFieldValidationKey = (
  key: FieldValidationKey,
): key is FormatFieldErrorSource =>
  key === "format" ||
  key === "amount" ||
  key === "pictureSleeve" ||
  key === "jukeboxHole";

export const fieldErrorDictKey = (
  key: FieldValidationKey,
): keyof FieldErrorsDict => {
  if (isReleaseDateFieldValidationKey(key)) {
    return "releaseDate";
  }

  if (isFormatFieldValidationKey(key)) {
    return "formats";
  }

  return key;
};

export const defaultFormatInputRow = (): AddReleaseFormFormatInput => ({
  formatId: "",
  shortName: "",
  amount: "1",
  pictureSleeve: true,
  jukeboxHole: false,
});
