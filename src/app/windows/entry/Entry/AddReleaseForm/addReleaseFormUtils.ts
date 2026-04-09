import { v4 as uuidv4 } from "uuid";

import type { GeneralizedDateFormInputValue } from "@/app/components/GeneralizedDateFormInput";

export type AddReleaseFormFormatInput = {
  id: string;
  formatId: string;
  shortName: string;
  amount: string;
  pictureSleeve: boolean;
  jukeboxHole: boolean;
};

export type ReleaseDateFieldErrorSource = keyof GeneralizedDateFormInputValue;

export const FORMAT_FIELD_KINDS = [
  "format",
  "amount",
  "pictureSleeve",
  "jukeboxHole",
] as const;

export type FormatFieldKind = (typeof FORMAT_FIELD_KINDS)[number];

export type FormatFieldErrorSource = {
  rowId: string;
  field: FormatFieldKind;
};

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

const isFormatFieldKind = (value: string): value is FormatFieldKind =>
  (FORMAT_FIELD_KINDS as readonly string[]).includes(value);

export const isReleaseDateFieldValidationKey = (
  key: FieldValidationKey,
): key is ReleaseDateFieldErrorSource =>
  key === "year" || key === "month" || key === "day";

export const isFormatFieldValidationKey = (
  key: FieldValidationKey,
): key is FormatFieldErrorSource =>
  typeof key === "object" &&
  !Array.isArray(key) &&
  "rowId" in key &&
  "field" in key &&
  typeof key.rowId === "string" &&
  typeof key.field === "string" &&
  isFormatFieldKind(key.field);

export const fieldValidationKeysEqual = (
  a: FieldValidationKey | undefined,
  b: FieldValidationKey,
): boolean => {
  if (a === undefined) {
    return false;
  }

  if (a === b) {
    return true;
  }

  return (
    isFormatFieldValidationKey(a) &&
    isFormatFieldValidationKey(b) &&
    a.rowId === b.rowId &&
    a.field === b.field
  );
};

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
  id: uuidv4(),
  formatId: "",
  shortName: "",
  amount: "1",
  pictureSleeve: true,
  jukeboxHole: false,
});
