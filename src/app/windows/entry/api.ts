import type { GetEntryById } from "@/types/entries";
import type { ReleasesFormatListItem } from "@/types/formats";
import type { LabelListItem } from "@/types/labels";
import type { GetEntryReleases, GetReleaseById } from "@/types/releases";
import type { TagListItem } from "@/types/tags";

export type API = {
  fetchLabels: () => Promise<LabelListItem[]>;
  fetchReleasesFormats: () => Promise<ReleasesFormatListItem[]>;
  fetchTags: () => Promise<TagListItem[]>;
  getEntryById: GetEntryById;
  getEntryReleases: GetEntryReleases;
  getReleaseById: GetReleaseById;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const api: API = (window as any).api;

export default api;
