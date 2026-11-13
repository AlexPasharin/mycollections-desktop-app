import type { Insertable, Updateable } from "kysely";

import type { RelatedItemRelation } from "./common";

import type { DbSource } from "@/db/db-source";
import type { GeneralizedDateFromDb } from "@/types/date";
import type { MusicalEntry } from "@/types/db/database";
import type { TagListItem } from "@/types/tags";

export type CreateArtistWindowParams = {
  artistId: string;
  source: DbSource;
};

export type CreateEntryWindowParams = {
  entryId: string;
  source: DbSource;
  releaseId?: string;
};

export type EntrySearchResultArtist = {
  artistId: string;

  /** Entry-specific artist's alternative name when set, otherwise the artist's main name. */
  artistName: string;
  isEntriesMainArtist: boolean;
};

export type EntrySearchResult = {
  entryId: string;
  mainName: string;
  types: string[];
  altNames: string[];
  artists: EntrySearchResultArtist[];
};

export type EntryArtistInfo = {
  artistId: string;
  isEntriesMainArtist: boolean | null;

  /** Entry-specific artist's alternative name when set, otherwise the artist's main name. */
  artistName: string;
  entryArtistAltNameId: string | null; // id of artist's alt name DB record
};

export type EntryAltNameInfo = {
  nameId: string;
  name: string;
};

export type EntryTypeInfo = {
  entryTypeId: string;
  name: string;
};

export type RelatedEntryItem = {
  entryId: string;
  mainName: string;
  childEntryOrderNumber: number;
  artists: EntryArtistInfo[];
};

export type EntryByIdResult = {
  entryId: string;
  mainName: string;
  originalReleaseDate: GeneralizedDateFromDb;
  comment: string | null;
  discogsUrl: string | null;
  partOfQueenCollection: boolean;
  relationToQueen: string | null;
  artists: EntryArtistInfo[];
  types: EntryTypeInfo[];
  altNames: EntryAltNameInfo[];
  tags: TagListItem[];
  parentEntries: RelatedEntryItem[];
  childEntries: RelatedEntryItem[];
};

export type GetEntryById = (
  entryId: string,
  dbSource: DbSource,
) => Promise<EntryByIdResult | undefined>;

export type SearchEntriesParams = {
  /** When set, only this artist's entries are searched; otherwise all entries are. */
  artistId?: string;
  query: string;
  limit: number;

  /** Opaque cursor from the previous page's `nextCursor`. */
  cursor?: string | null;
};

export type SearchEntriesResult = {
  items: EntrySearchResult[];

  /**
   * When non-null, the first row of the next page (opaque). Pass as `cursor` on the next
   * request (same artistId, query, limit). Null means nothing left to load after `items`.
   */
  nextCursor: string | null;
};

export type SearchEntries = (
  params: SearchEntriesParams,
  dbSource: DbSource,
) => Promise<SearchEntriesResult>;

export type MusicalEntryAltNameInput = { nameId?: string; name: string };

export type MusicalEntryArtistInput = {
  artistId: string;
  entryArtistAltNameId: string | null;
  isEntriesMainArtist: boolean;
};

export type MusicalEntryRelatedEntryInput = {
  relatedEntryId: string;
  relation: RelatedItemRelation;
  childEntryOrderNumber: number;
};

interface UpsertMusicalEntryBase {
  artists: MusicalEntryArtistInput[];
  tagIds: string[];
  typeIds: string[];
  altNames: MusicalEntryAltNameInput[];
  relatedEntries: MusicalEntryRelatedEntryInput[];
}

export type UpdateMusicalEntryInput = {
  entryId: string;
  entry: Omit<Updateable<MusicalEntry>, "entryId">;
} & UpsertMusicalEntryBase;

export type UpdateMusicalEntry = (
  input: UpdateMusicalEntryInput,
  dbSource: DbSource,
) => Promise<{ entry: EntryByIdResult; notifications: string[] }>;

export type CreateMusicalEntryInput = {
  entry: Insertable<MusicalEntry>;
} & UpsertMusicalEntryBase;

export type CreateMusicalEntry = (
  input: CreateMusicalEntryInput,
  dbSource: DbSource,
) => Promise<{ entry: EntryByIdResult; notifications: string[] }>;
