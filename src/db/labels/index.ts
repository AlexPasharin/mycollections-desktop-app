import client from "../client/kysely";

import type { LabelListItem } from "@/types/labels";

export const fetchLabels = (): Promise<LabelListItem[]> =>
  client
    .selectFrom("labels")
    .select(["labelId", "name"])
    .orderBy("name")
    .execute();
