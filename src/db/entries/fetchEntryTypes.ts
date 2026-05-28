import { dbClient } from "../client/kysely";

import type { FetchEntryTypes } from "@/types/entryTypes";

export const fetchEntryTypes: FetchEntryTypes = (dbSource) =>
  dbClient(dbSource)
    .selectFrom("musicalEntryTypes")
    .selectAll()
    .orderBy("name")
    .execute();
