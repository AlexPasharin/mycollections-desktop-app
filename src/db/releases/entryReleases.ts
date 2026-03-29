import { sql } from "kysely";

import client from "../client/kysely";
import { aggregateDistinctValuesToArray } from "../utils";

import type { EntryRelease } from "@/types/releases";

export const getEntryReleases = (entryId: string): Promise<EntryRelease[]> =>
  client
    .selectFrom("musicalReleases")
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
    .where("musicalReleases.entryId", "=", entryId)
    .select((eb) => [
      "musicalReleases.releaseId",
      eb.ref("musicalReleases.releaseVersion").as("version"),
      aggregateDistinctValuesToArray("releasesFormats.shortName", "formats"),
    ])
    .groupBy([
      "musicalReleases.releaseId",
      "musicalReleases.releaseVersion",
      "musicalReleases.releaseDate",
    ])
    .orderBy(
      sql`generalised_date_to_date(${sql.ref("musicalReleases.releaseDate")}, true)`,
    )
    .orderBy("musicalReleases.releaseId")
    .execute();
