import type { GeneralizedDateFormInputValue } from "@/app/components/GeneralizedDateFormInput";
import type { FormFieldError } from "@/types/form";

export type UpsertEntryAltNameRowId = string;

export type UpsertEntryAltNamesErrors = Record<
  UpsertEntryAltNameRowId,
  FormFieldError[]
>;

export type UpsertEntryRelatedEntriesErrors = Record<string, FormFieldError[]>;

export const initialUpsertEntryFormFieldErrors = {
  mainName: [],
  originalReleaseDate: [],
  discogsUrl: [],
  comment: [],
  selectedTags: [],
  selectedTypes: [],
  altNames: {},
  relatedEntries: {},
  partOfQueenCollection: [],
  relationToQueen: [],
};

type UpsertEntryAltNameInputFieldKey = {
  rowId: UpsertEntryAltNameRowId;
};

type UpsertEntryRelatedEntriesInputFieldKey = {
  relatedEntryRowId: string;
};

export type UpsertEntryFormInputFieldKey =
  | Exclude<
      keyof typeof initialUpsertEntryFormFieldErrors,
      "originalReleaseDate" | "altNames" | "relatedEntries"
    >
  | keyof GeneralizedDateFormInputValue
  | UpsertEntryAltNameInputFieldKey
  | UpsertEntryRelatedEntriesInputFieldKey;

export const isAltNameInputFieldKey = (key: UpsertEntryFormInputFieldKey) =>
  typeof key === "object" && "rowId" in key;

export const isRelatedEntriesInputFieldKey = (
  key: UpsertEntryFormInputFieldKey,
) => typeof key === "object" && "relatedEntryRowId" in key;
