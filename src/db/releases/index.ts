import client from "../client/kysely";

import type { GetReleaseById } from "@/types/releases";

export { getEntryReleases } from "./entryReleases";

export const getReleaseById: GetReleaseById = (releaseId) =>
  client
    .selectFrom("musicalReleases")
    .selectAll()
    .where("releaseId", "=", releaseId)
    .executeTakeFirst();
