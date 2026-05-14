import { sql } from "kysely";

import { selectFromExtendedMusicalEntryRows } from "./utils";

import { aggregateDistinctValuesToArray } from "../utils";

import type {
  EntryAltNameInfo,
  EntryArtistInfo,
  GetEntryById,
} from "@/types/entries";
import type { TagListItem } from "@/types/tags";
import { parseStringAsGeneralizedDate } from "@/utils/date";

export const getEntryById: GetEntryById = async (entryId) => {
  const entry = await selectFromExtendedMusicalEntryRows()
    .leftJoin(
      "alternativeArtistNames",
      "musicalEntriesArtists.entryArtistNameId",
      "alternativeArtistNames.nameId",
    )
    .leftJoin(
      "musicalEntriesTags",
      "musicalEntries.entryId",
      "musicalEntriesTags.entryId",
    )
    .leftJoin("tags", "musicalEntriesTags.tagId", "tags.tagId")
    .where("musicalEntries.entryId", "=", entryId)
    .select([
      "musicalEntries.entryId",
      "musicalEntries.mainName",
      "musicalEntries.originalReleaseDate",
      "musicalEntries.comment",
      "musicalEntries.discogsUrl",
      "musicalEntries.partOfQueenCollection",
      "musicalEntries.relationToQueen",

      sql<EntryArtistInfo[]>`coalesce(
        jsonb_agg(DISTINCT jsonb_build_object(
          'artistId', ${sql.ref("musicalEntriesArtists.artistId")},
          'isEntriesMainArtist', ${sql.ref("musicalEntriesArtists.isEntriesMainArtist")},
          'artistName', coalesce(${sql.ref("alternativeArtistNames.name")}, ${sql.ref("artists.name")})
        )) FILTER (WHERE ${sql.ref("musicalEntriesArtists.id")} IS NOT NULL),
        '[]'::jsonb
      )`.as("artists"),

      aggregateDistinctValuesToArray("musicalEntryTypes.name", "types"),

      sql<EntryAltNameInfo[]>`coalesce(
        jsonb_agg(DISTINCT jsonb_build_object(
          'nameId', ${sql.ref("alternativeMusicalEntryNames.nameId")},
          'name', ${sql.ref("alternativeMusicalEntryNames.name")}
        )) FILTER (WHERE ${sql.ref("alternativeMusicalEntryNames.nameId")} IS NOT NULL),
        '[]'::jsonb
      )`.as("altNames"),

      sql<TagListItem[]>`coalesce(
        jsonb_agg(DISTINCT jsonb_build_object(
          'tagId', ${sql.ref("tags.tagId")},
          'tag', ${sql.ref("tags.tag")}
        )) FILTER (WHERE ${sql.ref("tags.tagId")} IS NOT NULL),
        '[]'::jsonb
      )`.as("tags"),
    ])
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

  if (!entry) {
    return entry;
  }

  return {
    ...entry,
    originalReleaseDate: parseStringAsGeneralizedDate(
      entry.originalReleaseDate,
    ),
  };
};
