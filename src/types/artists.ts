export type DBArtist = {
  artist_id: string;
  sort_key: string;
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
