import { dbClient } from "../client/kysely";

import type { DeleteRelease } from "@/types/releases";

export const deleteRelease: DeleteRelease = (releaseId, dbSource) =>
  dbClient(dbSource)
    .transaction()
    .execute(async (trx) => {
      // Children first; FKs to musical_releases are ON DELETE RESTRICT.
      const formats = await trx
        .deleteFrom("formatsOfReleases")
        .where("releaseId", "=", releaseId)
        .returningAll()
        .execute();

      const tags = await trx
        .deleteFrom("musicalReleasesTags")
        .where("releaseId", "=", releaseId)
        .returningAll()
        .execute();

      const release = await trx
        .deleteFrom("musicalReleases")
        .where("releaseId", "=", releaseId)
        .returningAll()
        .executeTakeFirst();

      return { release, formats, tags };
    });
