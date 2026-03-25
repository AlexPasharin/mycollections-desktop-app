import { sql } from "kysely";

import { selectFromExtendedMusicalEntryRows } from "./utils";

import { aggregateDistinctValuesToArray } from "../utils";

import type { EntryArtistInfo, GetEntryById } from "@/types/entries";

export const getEntryById: GetEntryById = (entryId) =>
  selectFromExtendedMusicalEntryRows()
    .leftJoin(
      "alternativeArtistNames",
      "musicalEntriesArtists.entryArtistNameId",
      "alternativeArtistNames.nameId",
    )
    .where("musicalEntries.entryId", "=", entryId)
    .select([
      "musicalEntries.entryId as entryId",
      "musicalEntries.mainName as mainName",
      "musicalEntries.originalReleaseDate as originalReleaseDate",
      "musicalEntries.comment as comment",
      "musicalEntries.discogsUrl as discogsUrl",
      "musicalEntries.partOfQueenCollection as partOfQueenCollection",
      "musicalEntries.relationToQueen as relationToQueen",
    ])
    .select(
      sql<EntryArtistInfo[]>`coalesce(
        jsonb_agg(DISTINCT jsonb_build_object(
          'artistId', ${sql.ref("musicalEntriesArtists.artistId")},
          'isEntriesMainArtist', ${sql.ref("musicalEntriesArtists.isEntriesMainArtist")},
          'artistName', coalesce(${sql.ref("alternativeArtistNames.name")}, ${sql.ref("artists.name")})
        )) FILTER (WHERE ${sql.ref("musicalEntriesArtists.id")} IS NOT NULL),
        '[]'::jsonb
      )`.as("artists"),
    )
    .select(
      aggregateDistinctValuesToArray("musicalEntryTypes.name").as("types"),
    )
    .select(
      aggregateDistinctValuesToArray("alternativeMusicalEntryNames.name").as(
        "altNames",
      ),
    )
    .groupBy([
      "musicalEntries.entryId",
      "musicalEntries.mainName",
      "musicalEntries.originalReleaseDate",
      "musicalEntries.comment",
      "musicalEntries.discogsUrl",
      "musicalEntries.partOfQueenCollection",
      "musicalEntries.relationToQueen",
    ])
    .executeTakeFirst();
