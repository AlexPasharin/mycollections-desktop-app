import type { QueryArtist } from "@/types/artists";
import type { CreateArtistEntriesWindowParams } from "@/types/entries";

export type API = {
  queryArtists: QueryArtist;
  openNewArtistEntriesListWindow: (
    params: CreateArtistEntriesWindowParams,
  ) => void;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const api: API = (window as any).api;

export default api;
