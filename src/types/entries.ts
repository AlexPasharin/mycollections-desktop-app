import type { GeneralizedDateFromDb } from "@/types/date";

export type CreateArtistWindowParams = { artistId: string };

/** Stored original release date failed parse or calendar validation (see {@link getEntryById}). */
export type EntryOriginalReleaseDate = GeneralizedDateFromDb;

export type CreateEntryWindowParams = { entryId: string };

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

export type EntryByIdResult = {
  entryId: string;
  mainName: string;
  originalReleaseDate: EntryOriginalReleaseDate;
  comment: string | null;
  discogsUrl: string | null;
  partOfQueenCollection: boolean;
  relationToQueen: string | null;
  artists: EntryArtistInfo[];
  types: string[];
  altNames: string[];
  tags: string[];
};

export type GetEntryById = (
  entryId: string,
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
) => Promise<SearchArtistEntriesResult>;
