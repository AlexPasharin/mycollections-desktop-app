import type { Insertable, Kysely } from "kysely";

import type { DB, ParentMusicalRelease } from "@/types/db/database";
import type { MusicalReleaseRelatedReleaseInput } from "@/types/releases";

export const toParentMusicalReleaseRows = (
  releaseId: string,
  relatedReleases: MusicalReleaseRelatedReleaseInput[],
): Insertable<ParentMusicalRelease>[] =>
  relatedReleases.map(({ relatedReleaseId, relation }) =>
    relation === "parent"
      ? { parentReleaseId: relatedReleaseId, childReleaseId: releaseId }
      : { parentReleaseId: releaseId, childReleaseId: relatedReleaseId },
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
