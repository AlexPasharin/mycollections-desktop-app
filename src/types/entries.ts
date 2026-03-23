export type CreateArtistEntriesWindowParams = { artistId: string };

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

  /** True iff at least one more row exists after `items` for the same search. */
  hasMore: boolean;

  /**
   * Set only when `hasMore` is true: pass to the next request as `cursor`
   * (same artistId, query, limit).
   */
  nextCursor: string | null;
};

export type SearchArtistEntries = (
  params: SearchArtistEntriesParams,
) => Promise<SearchArtistEntriesResult>;
