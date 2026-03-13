export type CreateArtistEntriesWindowParams = { artistId: string };

export type EntrySearchResult = {
  entryId: string;
  mainName: string;
};

export type SearchEntriesByArtistParams = {
  artistId: string;
  query: string;
};

export type SearchEntriesByArtist = (
  params: SearchEntriesByArtistParams,
) => Promise<EntrySearchResult[]>;
