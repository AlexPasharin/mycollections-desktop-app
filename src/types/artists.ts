export type DBArtist = {
  artist_id: string;
  sort_key: string;
  name: string;
};

export type DBArtistCursor = Omit<DBArtist, "name">;

export type FetchArtistsParams = {
  cursor: DBArtistCursor | null;
  batchSize?: number;
};

export type FetchArtists = (params: FetchArtistsParams) => Promise<{
  artists: DBArtist[];
  next: DBArtistCursor | null;
}>;
