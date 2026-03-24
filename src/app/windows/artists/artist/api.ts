import type { GetArtistById } from "@/types/artists";
import type { SearchArtistEntries } from "@/types/entries";

export type API = {
  getArtistById: GetArtistById;
  searchArtistEntries: SearchArtistEntries;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const api: API = (window as any).api;

export default api;
