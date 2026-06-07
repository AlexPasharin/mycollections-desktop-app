import { dbClient } from "../client/kysely";

import type { FetchTags } from "@/types/tags";

export const fetchTags: FetchTags = (dbSource) =>
  dbClient(dbSource)
    .selectFrom("tags")
    .select(["tagId", "tag"])
    .orderBy("tag")
    .execute();
