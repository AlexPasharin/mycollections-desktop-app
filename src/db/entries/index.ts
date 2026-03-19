import { sql } from "kysely";

import client from "../client/kysely";
import { similarityToQuery } from "../utils";

import type { SearchArtistEntries } from "@/types/entries";

export const searchArtistEntries: SearchArtistEntries = ({
  artistId,
  query,
  limit = 10,
}) =>
  client
    .selectFrom("musicalEntries")
    .innerJoin(
      "musicalEntriesArtists",
      "musicalEntries.entryId",
      "musicalEntriesArtists.entryId",
    )

    // for types we use left join because we also want to get entries that have no types
    .leftJoin(
      "typesOfMusicalEntries",
      "musicalEntries.entryId",
      "typesOfMusicalEntries.entryId",
    )
    .leftJoin(
      "musicalEntryTypes",
      "typesOfMusicalEntries.typeId",
      "musicalEntryTypes.entryTypeId",
    )
    .select((eb) => [
      eb.ref("musicalEntries.entryId").as("entryId"),
      eb.ref("musicalEntries.mainName").as("mainName"),

      // this aggregates possibly different types of entry into a single jsonb array (which will automatically become an array of strings in typescript result)
      // note that filtering on non null is needed so that we don't get an array with a null value when entry has no types
      // coalesce is used to return an empty array if entry has no types, otherwise we would get a null value for "types"
      sql<string[]>`coalesce(
        json_agg(${sql.ref("musical_entry_types.name")} ORDER BY ${sql.ref("musical_entry_types.name")})
          FILTER (WHERE ${sql.ref("musical_entry_types.name")} IS NOT NULL),
        '[]'::json
      )`.as("types"),
    ])
    .where("musicalEntriesArtists.artistId", "=", artistId)
    .where("musicalEntries.mainName", "ilike", `%${query.trim()}%`)
    .groupBy("musicalEntries.entryId")

    // order by main name similarity to query to get the most relevant entries first
    .orderBy(similarityToQuery("musicalEntries.mainName", query), "desc")
    .limit(limit)
    .execute();
