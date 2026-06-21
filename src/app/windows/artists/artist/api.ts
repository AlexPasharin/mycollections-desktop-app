import type { GetArtistById } from "@/types/artists";
import type {
  CreateEntryWindowParams,
  CreateMusicalEntry,
  SearchArtistEntries,
} from "@/types/entries";

export type API = {
  getArtistById: GetArtistById;
  searchArtistEntries: SearchArtistEntries;
  createMusicalEntry: CreateMusicalEntry;
  openNewEntryWindow: (params: CreateEntryWindowParams) => void;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const api: API = (window as any).api;

export default api;
