import type { GeneralizedDateFormInputValue } from "@/app/components/GeneralizedDateFormInput";
import type { FormFieldError } from "@/types/form";

export type UpsertEntryAltNameRowId = string;

export type UpsertEntryAltNamesErrors = Record<
  UpsertEntryAltNameRowId,
  FormFieldError[]
>;

export type UpsertEntryArtistsErrors = Record<string, FormFieldError[]>;

export type UpsertEntryArtistFieldSource =
  | "artistId"
  | "entryArtistAltNameId"
  | "isEntriesMainArtist";

export const initialUpsertEntryFormFieldErrors = {
  mainName: [],
  originalReleaseDate: [],
  discogsUrl: [],
  comment: [],
  selectedTags: [],
  selectedTypes: [],
  artists: {},
  altNames: {},
  relatedEntries: [],
  partOfQueenCollection: [],
  relationToQueen: [],
};

type UpsertEntryAltNameInputFieldKey = {
  rowId: UpsertEntryAltNameRowId;
};

type UpsertEntryRelatedEntriesInputFieldKey = {
  relatedEntryRowId: string;
};

type UpsertEntryArtistsInputFieldKey = {
  artistRowId: string;
  source: UpsertEntryArtistFieldSource;
};

export type UpsertEntryFormInputFieldKey =
  | Exclude<
      keyof typeof initialUpsertEntryFormFieldErrors,
      "originalReleaseDate" | "artists" | "altNames" | "relatedEntries"
    >
  | keyof GeneralizedDateFormInputValue
  | UpsertEntryAltNameInputFieldKey
  | UpsertEntryRelatedEntriesInputFieldKey
  | UpsertEntryArtistsInputFieldKey;

export const isAltNameInputFieldKey = (key: UpsertEntryFormInputFieldKey) =>
  typeof key === "object" && "rowId" in key;

export const isRelatedEntriesInputFieldKey = (
  key: UpsertEntryFormInputFieldKey,
) => typeof key === "object" && "relatedEntryRowId" in key;

export const isArtistsInputFieldKey = (key: UpsertEntryFormInputFieldKey) =>
  typeof key === "object" && "artistRowId" in key;
