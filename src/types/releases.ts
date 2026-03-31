import type { Selectable } from "kysely";

import type { ReleaseCatNumbers } from "../validation/releases/cat_numbers";
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

export type JsonParsingErrorData = { rawJson: unknown; error: string };

export type ReleaseByIdResult = Omit<
  Selectable<MusicalRelease>,
  "countries" | "catalogueNumbers"
> & {
  tags: string[];
  formats: ReleaseFormatOfReleaseItem[];
  countries: ReleaseCountries | JsonParsingErrorData;
  catalogueNumbers: ReleaseCatNumbers | JsonParsingErrorData;
};

export type GetReleaseById = (
  releaseId: string,
) => Promise<ReleaseByIdResult | undefined>;
