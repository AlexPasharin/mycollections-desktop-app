import type { GeneralizedDateFormInputValue } from "@/app/components/GeneralizedDateFormInput";
import type { FormFieldError } from "@/types/form";

export type EditEntryAltNameRowId = string;

export type EditEntryAltNamesErrors = Record<
  EditEntryAltNameRowId,
  FormFieldError[]
>;

export const initialEditEntryFormFieldErrors = {
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

type EditEntryAltNameInputFieldKey = {
  rowId: EditEntryAltNameRowId;
};

export type EditEntryFormInputFieldKey =
  | Exclude<
      keyof typeof initialEditEntryFormFieldErrors,
      "originalReleaseDate" | "altNames"
    >
  | keyof GeneralizedDateFormInputValue
  | EditEntryAltNameInputFieldKey;

export const isAltNameInputFieldKey = (key: EditEntryFormInputFieldKey) =>
  typeof key === "object" && "rowId" in key;
