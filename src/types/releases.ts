import type { Selectable } from "kysely";

import type { MusicalRelease } from "@/types/db/database";

export type ReleaseFormatOfReleaseItem = {
  id: string;
  jukeboxHole: boolean;
  pictureSleeve: boolean;
  speed: unknown;
  amount: number;
  shortName: string;
};

export type EntryRelease = {
  releaseId: string;
  version: string;
  formats: string[];
};

export type GetEntryReleases = (entryId: string) => Promise<EntryRelease[]>;

export type ReleaseByIdResult = Selectable<MusicalRelease> & {
  tags: string[];
  formats: ReleaseFormatOfReleaseItem[];
};

export type GetReleaseById = (
  releaseId: string,
) => Promise<ReleaseByIdResult | undefined>;
