import type { Updateable } from "kysely";

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
};

export type EntrySearchResult = {
  entryId: string;
  mainName: string;
  types: string[];
  altNames: string[];
};

export type EntryArtistInfo = {
  artistId: string;
  isEntriesMainArtist: boolean | null;

  /** Entry-specific artist's alternative name when set, otherwise the artist's main name. */
  artistName: string;
};

export type EntryAltNameInfo = {
  nameId: string;
  name: string;
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
  types: string[];
  altNames: EntryAltNameInfo[];
  tags: TagListItem[];
};

export type GetEntryById = (
  entryId: string,
  dbSource: DbSource,
) => Promise<EntryByIdResult | undefined>;

export type SearchArtistEntriesParams = {
  artistId: string;
  query: string;
  limit: number;

  /** Opaque cursor from the previous page's `nextCursor`. */
  cursor?: string | null;
};

export type SearchArtistEntriesResult = {
  items: EntrySearchResult[];

  /**
   * When non-null, the first row of the next page (opaque). Pass as `cursor` on the next
   * request (same artistId, query, limit). Null means nothing left to load after `items`.
   */
  nextCursor: string | null;
};

export type SearchArtistEntries = (
  params: SearchArtistEntriesParams,
  dbSource: DbSource,
) => Promise<SearchArtistEntriesResult>;

export type UpdateMusicalEntryAltNameInput = { nameId?: string; name: string };

export type UpdateMusicalEntryInput = {
  entryId: string;
  entry: Omit<Updateable<MusicalEntry>, "entryId">;
  tagIds: string[];
  typeIds: string[];
  altNames: UpdateMusicalEntryAltNameInput[];
};

export type UpdateMusicalEntry = (
  input: UpdateMusicalEntryInput,
  dbSource: DbSource,
) => Promise<{ entry: EntryByIdResult; notifications: string[] }>;
