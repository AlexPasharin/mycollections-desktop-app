export type DBArtist = {
  artist_id: string;
  sort_key: string;
  name: string;
};

export type FetchArtistsParams = {
  cursor: DBArtist | null;
};
