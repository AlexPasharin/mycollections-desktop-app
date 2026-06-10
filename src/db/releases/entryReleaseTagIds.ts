import { dbClient } from "../client/kysely";

import type { GetEntryReleaseTagIds } from "@/types/releases";

export const getEntryReleaseTagIds: GetEntryReleaseTagIds = (
  entryId,
  dbSource,
) =>
  dbClient(dbSource)
    .selectFrom("musicalReleases")
    .innerJoin(
      "musicalReleasesTags",
      "musicalReleases.releaseId",
      "musicalReleasesTags.releaseId",
    )
    .where("musicalReleases.entryId", "=", entryId)
    .select("musicalReleasesTags.tagId")
    .distinct()
    .execute()
    .then((rows) => rows.map((row) => row.tagId));
