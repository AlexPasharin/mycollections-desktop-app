import type { GetArtistById, UpdateArtist } from "@/types/artists";
import type {
  CreateArtistWindowParams,
  CreateEntryWindowParams,
  CreateMusicalEntry,
  SearchEntries,
} from "@/types/entries";
import type { FetchEntryTypes } from "@/types/entryTypes";
import type { FetchTags } from "@/types/tags";

export type API = {
  getArtistById: GetArtistById;
  updateArtist: UpdateArtist;
  searchEntries: SearchEntries;
  fetchTags: FetchTags;
  fetchEntryTypes: FetchEntryTypes;
  createMusicalEntry: CreateMusicalEntry;
  openNewEntryWindow: (params: CreateEntryWindowParams) => void;
  openNewArtistWindow: (params: CreateArtistWindowParams) => void;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const api: API = (window as any).api;

export default api;
