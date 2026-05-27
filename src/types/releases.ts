import type { Insertable, Selectable } from "kysely";

import type { ReleaseCatNumbers } from "../validation/releases/catNumbers";
import type { ReleaseCountries } from "../validation/releases/countries";
import type { ReleaseMatrixRunout } from "../validation/releases/matrixRunout";

import type { DbSource } from "@/db/db-source";
import type { GeneralizedDateFromDb } from "@/types/date";
import type {
  FormatOfRelease,
  MusicalRelease,
  MusicalReleaseTag,
} from "@/types/db/database";

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

export type GetEntryReleases = (
  entryId: string,
  dbSource: DbSource,
) => Promise<EntryRelease[]>;

export type JsonParsingErrorData = { rawJson: unknown; error: string };

export type ReleaseByIdResult = Omit<
  Selectable<MusicalRelease>,
  | "countries"
  | "catalogueNumbers"
  | "matrixRunout"
  | "releaseAlternativeNameId"
  | "releaseDate"
> & {
  releaseDate: GeneralizedDateFromDb;
  tags: string[];
  formats: ReleaseFormatOfReleaseItem[];
  alternativeName: string | null;
  countries: ReleaseCountries | JsonParsingErrorData;
  catalogueNumbers: ReleaseCatNumbers | JsonParsingErrorData;
  matrixRunout: ReleaseMatrixRunout | JsonParsingErrorData;
};

export type GetReleaseById = (
  releaseId: string,
  dbSource: DbSource,
) => Promise<ReleaseByIdResult | undefined>;

export type CreateMusicalReleaseInput = {
  release: Insertable<MusicalRelease>;
  formats: Omit<Insertable<FormatOfRelease>, "releaseId">[];
  tagIds: string[];
};

export type CreateMusicalRelease = (
  input: CreateMusicalReleaseInput,
  dbSource: DbSource,
) => Promise<{ releaseId: string; notifications: string[] }>;

export type DeleteReleaseResult = {
  release: Selectable<MusicalRelease> | undefined;
  formats: Selectable<FormatOfRelease>[];
  tags: Selectable<MusicalReleaseTag>[];
};

export type DeleteRelease = (
  releaseId: string,
  dbSource: DbSource,
) => Promise<DeleteReleaseResult>;
