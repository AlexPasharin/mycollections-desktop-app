import type { FetchArtists, QueryArtist } from "@/types/artists";
import type { CreateArtistWindowParams } from "@/types/entries";
import type { CreateTagsWindowParams } from "@/types/tags";

export type API = {
  fetchArtists: FetchArtists;
  queryArtists: QueryArtist;
  openNewArtistWindow: (params: CreateArtistWindowParams) => void;
  openNewTagsWindow: (params: CreateTagsWindowParams) => void;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const api: API = (window as any).api;

export default api;
