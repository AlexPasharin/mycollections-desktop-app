import type { FetchCountries } from "@/types/countries";
import type { GetEntryById } from "@/types/entries";
import type { FetchReleasesFormats } from "@/types/formats";
import type { FetchLabels } from "@/types/labels";
import type {
  CreateMusicalRelease,
  DeleteRelease,
  GetEntryReleases,
  GetReleaseById,
} from "@/types/releases";
import type { FetchTags } from "@/types/tags";

export type API = {
  fetchCountries: FetchCountries;
  fetchLabels: FetchLabels;
  fetchReleasesFormats: FetchReleasesFormats;
  fetchTags: FetchTags;
  getEntryById: GetEntryById;
  getEntryReleases: GetEntryReleases;
  getReleaseById: GetReleaseById;
  createMusicalRelease: CreateMusicalRelease;
  deleteRelease: DeleteRelease;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const api: API = (window as any).api;

export default api;
