import { dbClient } from "../client/kysely";

import type { DbSource } from "@/db/db-source";
import type { TagListItem } from "@/types/tags";

export const fetchTags = (dbSource?: DbSource): Promise<TagListItem[]> =>
  dbClient(dbSource).selectFrom("tags").select(["tagId", "tag"]).execute();
