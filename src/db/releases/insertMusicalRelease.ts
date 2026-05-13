import client from "../client/kysely";
import { toJsonbParam } from "../utils";

import type { InsertMusicalRelease } from "@/types/releases";

export const insertMusicalRelease: InsertMusicalRelease = async (values) => {
  const { releaseId } = await client
    .insertInto("musicalReleases")
    .values({
      ...values,

      // `pg` doesn't reliably serialize arrays / strings / etc. into the
      // jsonb wire format; encode each jsonb column ourselves.
      countries: toJsonbParam(values.countries),
      catalogueNumbers: toJsonbParam(values.catalogueNumbers),
      matrixRunout: toJsonbParam(values.matrixRunout),
    })
    .returning("releaseId")
    .executeTakeFirstOrThrow();

  return releaseId;
};
