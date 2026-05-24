import { dbClient } from "../client/kysely";

import type { DbSource } from "@/db/db-source";
import type { ReleasesFormatListItem } from "@/types/formats";

export const fetchReleasesFormats = (
  dbSource?: DbSource,
): Promise<ReleasesFormatListItem[]> =>
  dbClient(dbSource)
    .selectFrom("releasesFormats")
    .select(["formatId", "shortName"])
    .orderBy("shortName")
    .execute();
