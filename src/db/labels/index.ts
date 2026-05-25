import { dbClient } from "../client/kysely";

import type { FetchLabels } from "@/types/labels";

export const fetchLabels: FetchLabels = (dbSource) =>
  dbClient(dbSource)
    .selectFrom("labels")
    .select(["labelId", "name"])
    .orderBy("name")
    .execute();
