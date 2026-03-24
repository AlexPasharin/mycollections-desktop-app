export type CreateArtistWindowParams = { artistId: string };

export type EntrySearchResult = {
  entryId: string;
  mainName: string;
  types: string[];
  altNames: string[];
};

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
