import type { GetEntryById } from "@/types/entries";
import type { GetEntryReleases, GetReleaseById } from "@/types/releases";

export type API = {
  getEntryById: GetEntryById;
  getEntryReleases: GetEntryReleases;
  getReleaseById: GetReleaseById;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const api: API = (window as any).api;

export default api;
