import client from "../client/kysely";

import type { ReleasesFormatListItem } from "@/types/formats";

export const fetchReleasesFormats = (): Promise<ReleasesFormatListItem[]> =>
  client
    .selectFrom("releasesFormats")
    .select(["formatId", "shortName"])
    .orderBy("shortName")
    .execute();
