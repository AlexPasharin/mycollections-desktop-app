import type { FetchArtists } from "@/types/artists";

export type OpenArtistEntriesWindowParams = {
  artistId: string;
};

export type API = {
  fetchArtists: FetchArtists;
  openNewArtistEntriesListWindow: (
    params: OpenArtistEntriesWindowParams,
  ) => void;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const api: API = (window as any).api;

export default api;
