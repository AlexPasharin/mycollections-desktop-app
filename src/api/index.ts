import type { DBArtist, FetchArtistsParams } from "../types/artists";

export type API = {
  fetchArtists: ({ cursor }: FetchArtistsParams) => Promise<DBArtist[]>;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const api: API = (window as any).api;

export default api;
