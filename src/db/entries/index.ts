import { sql } from "kysely";

import client from "../client/kysely";

import type { SearchArtistEntries } from "@/types/entries";

export const searchArtistEntries: SearchArtistEntries = ({
  artistId,
  query,
  limit,
}) => {
  const subquery = buildEntriesQueryByArtistIdAndNameSubstringMatch(
    artistId,
    query,
  );

  return (
    client
      .selectFrom(subquery.as("entries"))
      .select([
        "entry_id as entryId",
        "main_name as mainName",

        // this aggregates possibly different types of entry into a single jsonb array (which will automatically become an array of strings in typescript result)
        // note that filtering on non null is needed so that we don't get an array with a null value when entry has no types
        // coalesce is used to return an empty array if entry has no types, otherwise we would get a null value for "types"
        sql<string[]>`coalesce(
          jsonb_agg(DISTINCT ${sql.ref("type")} ORDER BY ${sql.ref("type")})
            FILTER (WHERE ${sql.ref("type")} IS NOT NULL),
          '[]'::jsonb
        )`.as("types"),

        // same for alternative names
        sql<string[]>`coalesce(
          jsonb_agg(DISTINCT ${sql.ref("alt_name")} ORDER BY ${sql.ref("alt_name")})
            FILTER (WHERE ${sql.ref("alt_name")} IS NOT NULL),
          '[]'::jsonb
        )`.as("altNames"),
      ])
      .groupBy(["entry_id", "main_name"])

      // order by discovered best name similarity to query to get the most relevant entries first
      .orderBy(sql`MAX(similarity)`, "desc")
      .orderBy("mainName", "asc")
      .orderBy("entryId", "asc")

      .limit(limit)
      .execute()
  );
};

// builds (but does not execute) a subquery that returns all "extended entry" records for a given artist and query
// every "extended entry" record contains entry_id, main_name, but also possible type and alternative_name (both lifted from other tables)
// entry must belong to the given artist and must have a name or alternative name that matches the query (in "case-insensitive substring match" sense)
// "best" similarity score is also returned as one of the fields, to be used for ordering the results by users of this function
const buildEntriesQueryByArtistIdAndNameSubstringMatch = (
  artistId: string,
  query: string,
) => {
  const trimmedQuery = query.trim();

  return (
    client
      .selectFrom("musicalEntries as e")
      .innerJoin("musicalEntriesArtists as a", "e.entryId", "a.entryId")

      // for musical entry types and alternative names we use left join because we also want to get entries that have no types or alternative names
      .leftJoin("alternativeMusicalEntryNames as n", "e.entryId", "n.entryId")
      .leftJoin("typesOfMusicalEntries as et", "e.entryId", "et.entryId")
      .leftJoin("musicalEntryTypes as t", "et.typeId", "t.entryTypeId")

      .select([
        "e.entryId as entry_id",
        "e.mainName as main_name",
        "n.name as alt_name",
        "t.name as type",

        // "best" similarity score is returned as one of the fields
        sql<number>`GREATEST(similarity(lower(e.main_name), '%queen%'), coalesce(similarity(lower(n.name), '%queen%'), 0))`.as(
          "similarity",
        ),
      ])

      .where("a.artistId", "=", artistId)
      .where((eb) =>
        eb.or([
          eb("e.mainName", "ilike", `%${trimmedQuery}%`),
          eb("n.name", "ilike", `%${trimmedQuery}%`),
        ]),
      )
  );
};
