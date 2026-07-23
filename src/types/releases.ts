import type { Insertable, Selectable, Updateable } from "kysely";

import type { EntryAltNameInfo } from "./entries";
import type { TagId, TagListItem } from "./tags";

import type { DbSource } from "@/db/db-source";
import type { GeneralizedDateFromDb } from "@/types/date";
import type {
  FormatOfRelease,
  MusicalRelease,
  MusicalReleaseTag,
} from "@/types/db/database";
import type {
  ReleaseCatNumbers,
  ReleaseCountries,
  ReleaseMatrixRunout,
} from "@/validation";

export type ReleaseFormatOfReleaseItem = {
  id: string;
  jukeboxHole: boolean;
  pictureSleeve: boolean;
  speed: unknown;
  amount: number;
  formatId: string;
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

export type GetEntryReleaseTagIds = (
  entryId: string,
  dbSource: DbSource,
) => Promise<TagId[]>;

export type JsonParsingErrorData = { rawJson: unknown; error: string };

export type RelatedReleaseArtist = {
  isEntriesMainArtist: boolean | null;
  artistName: string;
};

export type RelatedReleaseItem = {
  releaseId: string;
  releaseVersion: string;
  entryId: string;
  entryMainName: string;
  artists: RelatedReleaseArtist[];
};

export type ReleaseByIdResult = Omit<
  Selectable<MusicalRelease>,
  | "countries"
  | "catalogueNumbers"
  | "matrixRunout"
  | "releaseAlternativeNameId"
  | "releaseDate"
> & {
  releaseDate: GeneralizedDateFromDb;
  tags: TagListItem[];
  formats: ReleaseFormatOfReleaseItem[];
  alternativeName: EntryAltNameInfo | null;
  countries: ReleaseCountries | JsonParsingErrorData;
  catalogueNumbers: ReleaseCatNumbers | JsonParsingErrorData;
  matrixRunout: ReleaseMatrixRunout | JsonParsingErrorData;
  parentReleases: RelatedReleaseItem[];
  childReleases: RelatedReleaseItem[];
};

export type GetReleaseById = (
  releaseId: string,
  dbSource: DbSource,
) => Promise<ReleaseByIdResult | undefined>;

export type MusicalReleaseRelatedReleaseRelation = "parent" | "child";

export type MusicalReleaseRelatedReleaseInput = {
  relatedReleaseId: string;
  relation: MusicalReleaseRelatedReleaseRelation;
};

interface UpsertMusicalReleaseBase {
  formats: Omit<Insertable<FormatOfRelease>, "releaseId">[];
  tagIds: string[];
  relatedReleases: MusicalReleaseRelatedReleaseInput[];
}

export type CreateMusicalReleaseInput = UpsertMusicalReleaseBase & {
  release: Insertable<MusicalRelease>;
};

export type CreateMusicalRelease = (
  input: CreateMusicalReleaseInput,
  dbSource: DbSource,
) => Promise<{ releaseId: string; notifications: string[] }>;

export type UpdateMusicalReleaseInput = UpsertMusicalReleaseBase & {
  releaseId: string;
  release: Omit<Updateable<MusicalRelease>, "releaseId">;
};

export type UpdateMusicalRelease = (
  input: UpdateMusicalReleaseInput,
  dbSource: DbSource,
) => Promise<{ release: ReleaseByIdResult; notifications: string[] }>;

export type DeleteReleaseResult = {
  release: Selectable<MusicalRelease> | undefined;
  formats: Selectable<FormatOfRelease>[];
  tags: Selectable<MusicalReleaseTag>[];
};

export type DeleteRelease = (
  releaseId: string,
  dbSource: DbSource,
) => Promise<DeleteReleaseResult>;
