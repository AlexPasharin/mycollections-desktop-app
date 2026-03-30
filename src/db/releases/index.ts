import { sql } from "kysely";

import client from "../client/kysely";
import { aggregateDistinctValuesToArray } from "../utils";

import type {
  GetReleaseById,
  ReleaseFormatOfReleaseItem,
} from "@/types/releases";

export { getEntryReleases } from "./entryReleases";

const musicalReleaseColumns = [
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
] as const;

export const getReleaseById: GetReleaseById = (releaseId) =>
  client
    .selectFrom("musicalReleases")
    .leftJoin(
      "musicalReleasesTags",
      "musicalReleases.releaseId",
      "musicalReleasesTags.releaseId",
    )
    .leftJoin("tags", "musicalReleasesTags.tagId", "tags.tagId")
    .leftJoin(
      "formatsOfReleases",
      "musicalReleases.releaseId",
      "formatsOfReleases.releaseId",
    )
    .leftJoin(
      "releasesFormats",
      "formatsOfReleases.formatId",
      "releasesFormats.formatId",
    )
    .where("musicalReleases.releaseId", "=", releaseId)
    .select([
      ...musicalReleaseColumns,
      aggregateDistinctValuesToArray("tags.tag", "tags"),
      sql<ReleaseFormatOfReleaseItem[]>`coalesce(
        jsonb_agg(DISTINCT jsonb_build_object(
          'id', ${sql.ref("formatsOfReleases.id")},
          'jukeboxHole', ${sql.ref("formatsOfReleases.jukeboxHole")},
          'pictureSleeve', ${sql.ref("formatsOfReleases.pictureSleeve")},
          'speed', ${sql.ref("formatsOfReleases.speed")},
          'amount', ${sql.ref("formatsOfReleases.amount")},
          'shortName', ${sql.ref("releasesFormats.shortName")}
        )) FILTER (WHERE ${sql.ref("formatsOfReleases.id")} IS NOT NULL),
        '[]'::jsonb
      )`.as("formats"),
    ])
    .groupBy(musicalReleaseColumns)
    .executeTakeFirst();
