import type { MusicalEntryType } from "./db/database";

import type { DbSource } from "@/db/db-source";

type EntryTypeListItem = Omit<MusicalEntryType, "entryTypeId"> & {
  entryTypeId: string;
};

export type FetchEntryTypes = (
  dbSource: DbSource,
) => Promise<EntryTypeListItem[]>;
