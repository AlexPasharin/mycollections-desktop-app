import type { Selectable } from "kysely";

import type { ReleaseCountries } from "../validation/releases/countries";

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

export type ReleaseByIdResult = Omit<
  Selectable<MusicalRelease>,
  "countries"
> & {
  tags: string[];
  formats: ReleaseFormatOfReleaseItem[];
  countries: ReleaseCountries | { rawJson: unknown; error: string };
};

export type GetReleaseById = (
  releaseId: string,
) => Promise<ReleaseByIdResult | undefined>;
