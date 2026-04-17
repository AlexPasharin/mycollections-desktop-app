import client from "../client/kysely";

import type { TagListItem } from "@/types/tags";

export const fetchTags = (): Promise<TagListItem[]> =>
  client.selectFrom("tags").select(["tagId", "tag"]).orderBy("tag").execute();
