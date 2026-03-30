import type { Selectable } from "kysely";

import type { MusicalRelease } from "@/types/db/database";

export type EntryRelease = {
  releaseId: string;
  version: string;
  formats: string[];
};

export type GetEntryReleases = (entryId: string) => Promise<EntryRelease[]>;

export type ReleaseByIdResult = Selectable<MusicalRelease> & {
  tags: string[];
};

export type GetReleaseById = (
  releaseId: string,
) => Promise<ReleaseByIdResult | undefined>;
