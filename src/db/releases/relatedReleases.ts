import type { Insertable, Kysely } from "kysely";

import { PARENT_RELATION } from "@/constants";
import type { DB, ParentMusicalRelease } from "@/types/db/database";
import type { MusicalReleaseRelatedReleaseInput } from "@/types/releases";

export const toParentMusicalReleaseRows = (
  releaseId: string,
  relatedReleases: MusicalReleaseRelatedReleaseInput[],
): Insertable<ParentMusicalRelease>[] =>
  relatedReleases.map(
    ({ relatedReleaseId, relation, childReleaseOrderNumber }) =>
      relation === PARENT_RELATION
        ? {
            parentReleaseId: relatedReleaseId,
            childReleaseId: releaseId,
            childReleaseOrderNumber,
          }
        : {
            parentReleaseId: releaseId,
            childReleaseId: relatedReleaseId,
            childReleaseOrderNumber,
          },
  );

export const insertReleaseRelatedReleases = async (
  trx: Kysely<DB>,
  releaseId: string,
  relatedReleases: MusicalReleaseRelatedReleaseInput[],
) => {
  if (relatedReleases.length === 0) {
    return;
  }

  await trx
    .insertInto("parentMusicalReleases")
    .values(toParentMusicalReleaseRows(releaseId, relatedReleases))
    .execute();
};
