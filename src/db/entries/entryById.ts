import { sql } from "kysely";

import { selectFromExtendedMusicalEntryRows } from "./utils";

import { aggregateDistinctValuesToArray } from "../utils";

import type {
  EntryArtistInfo,
  EntryByIdResult,
  EntryOriginalReleaseDate,
  GetEntryById,
} from "@/types/entries";
import { parseGeneralizedDateString } from "@/utils/date";
import { createGeneralizedDateSchema } from "@/validation/generalizedDate";

export const getEntryById: GetEntryById = async (entryId) => {
  const row = await selectFromExtendedMusicalEntryRows()
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
      aggregateDistinctValuesToArray(
        "alternativeMusicalEntryNames.name",
        "altNames",
      ),
      aggregateDistinctValuesToArray("tags.tag", "tags"),
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

  if (row === undefined) {
    return undefined;
  }

  const { originalReleaseDate: originalReleaseDateRaw, ...rest } = row;

  return {
    ...rest,
    originalReleaseDate: postProcessOriginalReleaseDate(originalReleaseDateRaw),
  } satisfies EntryByIdResult;
};

const postProcessOriginalReleaseDate = (
  raw: string | null,
): EntryOriginalReleaseDate => {
  if (raw === null) {
    return null;
  }

  if (raw.trim() === "") {
    return null;
  }

  const parsed = parseGeneralizedDateString(raw);

  if (parsed === null) {
    return {
      value: raw,
      error: "Use a hyphen-separated date: YYYY, YYYY-MM, or YYYY-MM-DD.",
    };
  }

  const validated = createGeneralizedDateSchema().safeParse(parsed);

  if (!validated.success) {
    return {
      value: raw,
      error: validated.error.issues[0]?.message ?? "Invalid release date.",
    };
  }

  return validated.data;
};
