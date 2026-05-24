import { applyWithNotificationsFor } from "../client/kysely";
import { toJsonbParam } from "../utils";

import type { CreateMusicalRelease } from "@/types/releases";

export const createMusicalRelease: CreateMusicalRelease = async (
  { release, formats, tagIds },
  dbSource,
) => {
  const { results, notifications } = await applyWithNotificationsFor(
    async (trx) => {
      const { releaseId } = await trx
        .insertInto("musicalReleases")
        .values({
          ...release,

          // `pg` doesn't reliably serialize arrays / strings / etc. into the
          // jsonb wire format; encode each jsonb column ourselves.
          countries: toJsonbParam(release.countries),
          catalogueNumbers: toJsonbParam(release.catalogueNumbers),
          matrixRunout: toJsonbParam(release.matrixRunout),
        })
        .returning("releaseId")
        .executeTakeFirstOrThrow();

      if (formats.length > 0) {
        await trx
          .insertInto("formatsOfReleases")
          .values(formats.map((format) => ({ ...format, releaseId })))
          .execute();
      }

      if (tagIds.length > 0) {
        await trx
          .insertInto("musicalReleasesTags")
          .values(tagIds.map((tagId) => ({ releaseId, tagId })))
          .execute();
      }

      return { releaseId };
    },
    dbSource,
  );

  return { releaseId: results.releaseId, notifications };
};
