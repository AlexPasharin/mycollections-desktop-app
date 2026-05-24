import { dbClient } from "../client/kysely";

import type { DbSource } from "@/db/db-source";
import type { LabelListItem } from "@/types/labels";

export const fetchLabels = (dbSource?: DbSource): Promise<LabelListItem[]> =>
  dbClient(dbSource)
    .selectFrom("labels")
    .select(["labelId", "name"])
    .orderBy("name")
    .execute();
