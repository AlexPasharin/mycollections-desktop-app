export type CreateArtistEntriesWindowParams = { artistId: string };

export type EntrySearchResult = {
  entryId: string;
  mainName: string;
  types: string[];
};

export type SearchArtistEntriesParams = {
  artistId: string;
  query: string;
  limit?: number;
};

export type SearchArtistEntries = (
  params: SearchArtistEntriesParams,
) => Promise<EntrySearchResult[]>;
