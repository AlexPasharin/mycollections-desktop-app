import client from "../client/kysely";
import { aggregateDistinctValuesToArray } from "../utils";

import type { GetReleaseById } from "@/types/releases";

export { getEntryReleases } from "./entryReleases";

export const getReleaseById: GetReleaseById = (releaseId) =>
  client
    .selectFrom("musicalReleases")
    .leftJoin(
      "musicalReleasesTags",
      "musicalReleases.releaseId",
      "musicalReleasesTags.releaseId",
    )
    .leftJoin("tags", "musicalReleasesTags.tagId", "tags.tagId")
    .where("musicalReleases.releaseId", "=", releaseId)
    .select([
      "musicalReleases.releaseId",
      "musicalReleases.releaseVersion",
      "musicalReleases.releaseDate",
      "musicalReleases.discogsUrl",
      "musicalReleases.countries",
      "musicalReleases.catalogueNumbers",
      "musicalReleases.matrixRunout",
      "musicalReleases.comment",
      "musicalReleases.conditionProblems",
      "musicalReleases.partOfQueenCollection",
      "musicalReleases.relationToQueen",
      "musicalReleases.releaseAlternativeNameId",
      "musicalReleases.entryId",
      aggregateDistinctValuesToArray("tags.tag", "tags"),
    ])
    .groupBy([
      "musicalReleases.releaseId",
      "musicalReleases.releaseVersion",
      "musicalReleases.releaseDate",
      "musicalReleases.discogsUrl",
      "musicalReleases.countries",
      "musicalReleases.catalogueNumbers",
      "musicalReleases.matrixRunout",
      "musicalReleases.comment",
      "musicalReleases.conditionProblems",
      "musicalReleases.partOfQueenCollection",
      "musicalReleases.relationToQueen",
      "musicalReleases.releaseAlternativeNameId",
      "musicalReleases.entryId",
    ])
    .executeTakeFirst();
