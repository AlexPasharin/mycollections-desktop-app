import type { GeneralizedDateFormInputValue } from "@/app/components/GeneralizedDateFormInput";
import type { FormFieldError } from "@/types/form";

export type UpsertEntryAltNameRowId = string;

export type UpsertEntryAltNamesErrors = Record<
  UpsertEntryAltNameRowId,
  FormFieldError[]
>;

export const initialUpsertEntryFormFieldErrors = {
  mainName: [],
  originalReleaseDate: [],
  discogsUrl: [],
  comment: [],
  selectedTags: [],
  selectedTypes: [],
  altNames: {},
  partOfQueenCollection: [],
  relationToQueen: [],
};

type UpsertEntryAltNameInputFieldKey = {
  rowId: UpsertEntryAltNameRowId;
};

export type UpsertEntryFormInputFieldKey =
  | Exclude<
      keyof typeof initialUpsertEntryFormFieldErrors,
      "originalReleaseDate" | "altNames"
    >
  | keyof GeneralizedDateFormInputValue
  | UpsertEntryAltNameInputFieldKey;

export const isAltNameInputFieldKey = (key: UpsertEntryFormInputFieldKey) =>
  typeof key === "object" && "rowId" in key;
