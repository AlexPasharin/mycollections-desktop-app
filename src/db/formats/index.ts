import { dbClient } from "../client/kysely";

import type { FetchReleasesFormats } from "@/types/formats";

export const fetchReleasesFormats: FetchReleasesFormats = (dbSource) =>
  dbClient(dbSource)
    .selectFrom("releasesFormats")
    .select(["formatId", "shortName"])
    .orderBy("shortName")
    .execute();
