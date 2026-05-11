import client from "../client/kysely";

import type { InsertMusicalRelease } from "@/types/releases";

export const insertMusicalRelease: InsertMusicalRelease = async (values) => {
  const { releaseId } = await client
    .insertInto("musicalReleases")
    .values(values)
    .returning("releaseId")
    .executeTakeFirstOrThrow();

  return releaseId;
};
