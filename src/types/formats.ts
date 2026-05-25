import type { DbSource } from "@/db/db-source";

export type ReleasesFormatListItem = {
  formatId: string;
  shortName: string;
};

export type FetchReleasesFormats = (
  dbSource: DbSource,
) => Promise<ReleasesFormatListItem[]>;
