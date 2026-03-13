export type DBArtist = {
  artistId: string;
  sortKey: string;
  name: string;
};

export type FetchArtistsParams = {
  artistForCompare: DBArtist | null;
  batchSize?: number;
  direction: "next" | "prev";
};

export type FetchArtistsResponse = {
  artists: DBArtist[];
  prev: DBArtist | undefined;
  next: DBArtist | undefined;
};

export type FetchArtists = (
  params: FetchArtistsParams,
) => Promise<FetchArtistsResponse>;

export type QueriedArtist = {
  id: string;
  name: string;
};

export type ArtistQueryResult = {
  substringMatches: QueriedArtist[];
  fuzzySearch: QueriedArtist[];
} | null;

export type QueryArtist = (query: string) => Promise<ArtistQueryResult>;

export type ArtistByIdResult = Pick<DBArtist, "artistId" | "name">;

export type GetArtistById = (
  artistId: string,
) => Promise<ArtistByIdResult | undefined>;
