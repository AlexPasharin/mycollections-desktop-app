import type { FetchCountries } from "@/types/countries";
import type {
  CreateEntryWindowParams,
  GetEntryById,
  UpdateMusicalEntry,
} from "@/types/entries";
import type { FetchEntryTypes } from "@/types/entryTypes";
import type { FetchReleasesFormats } from "@/types/formats";
import type { FetchLabels } from "@/types/labels";
import type {
  CreateMusicalRelease,
  DeleteRelease,
  GetEntryReleases,
  GetEntryReleaseTagIds,
  GetReleaseById,
  UpdateMusicalRelease,
} from "@/types/releases";
import type { FetchTags } from "@/types/tags";

export type API = {
  fetchCountries: FetchCountries;
  fetchLabels: FetchLabels;
  fetchReleasesFormats: FetchReleasesFormats;
  fetchTags: FetchTags;
  fetchEntryTypes: FetchEntryTypes;
  getEntryById: GetEntryById;
  getEntryReleases: GetEntryReleases;
  getEntryReleaseTagIds: GetEntryReleaseTagIds;
  getReleaseById: GetReleaseById;
  createMusicalRelease: CreateMusicalRelease;
  updateMusicalRelease: UpdateMusicalRelease;
  deleteRelease: DeleteRelease;
  updateMusicalEntry: UpdateMusicalEntry;
  openNewEntryWindow: (params: CreateEntryWindowParams) => void;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const api: API = (window as any).api;

export default api;
