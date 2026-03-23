import { sql } from "kysely";

import client from "../client/kysely";

import type { SearchArtistEntries } from "@/types/entries";

export const searchArtistEntries: SearchArtistEntries = async ({
  artistId,
  query,
  limit,
  cursor,
}) => {
  const subquery = buildEntriesQueryByArtistIdAndNameSubstringMatch(
    artistId,
    query,
  );

  const cursorPayload = decodeCursor(cursor);

  let grouped = client
    .selectFrom(subquery.as("entries"))
    .select([
      "entry_id as entryId",
      "main_name as mainName",
      sql<number>`MAX(similarity)`.as("maxSimilarity"),

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
    .orderBy(sql`MAX(similarity)`, "desc")
    .orderBy("mainName", "asc")
    .orderBy("entry_id", "asc")
    .limit(limit + 1);

  if (cursorPayload) {
    // Sort: MAX(similarity) DESC, main_name ASC, entry_id ASC. Cursor = first row of next page;
    // keep rows at that position or later in the list (lower sim, or ties broken with > / >=).
    grouped = grouped.having(
      sql<boolean>`(MAX(similarity) < ${cursorPayload.s} OR (MAX(similarity) = ${cursorPayload.s} AND main_name > ${cursorPayload.m}) OR (MAX(similarity) = ${cursorPayload.s} AND main_name = ${cursorPayload.m} AND entry_id >= ${cursorPayload.i}))`,
    );
  }

  const queryResults = await grouped.execute();

  const pageRows = queryResults.slice(0, limit);
  const firstOfNextBatch = queryResults[limit];
  const nextCursor = firstOfNextBatch
    ? encodeCursor({
        s: firstOfNextBatch.maxSimilarity,
        m: firstOfNextBatch.mainName,
        i: firstOfNextBatch.entryId,
      })
    : null;

  const items = pageRows.map(({ entryId, mainName, types, altNames }) => ({
    entryId,
    mainName,
    types,
    altNames,
  }));

  return { items, nextCursor };
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
        sql<number>`GREATEST(similarity(lower(e.main_name), ${`%${trimmedQuery}%`}), coalesce(similarity(lower(n.name), ${`%${trimmedQuery}%`}), 0))`.as(
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

// Cursor JSON uses short keys on purpose: smaller payload after stringify + base64 (IPC / URLs).
// Meaning of keys: s — MAX(similarity), m — mainName, i — entryId (see grouped query ORDER BY / HAVING).
type CursorPayload = { s: number; m: string; i: string };

const encodeCursor = (p: CursorPayload): string =>
  Buffer.from(JSON.stringify(p), "utf8").toString("base64url");

const decodeCursor = (cursor?: string | null): CursorPayload | null => {
  if (cursor == null) {
    return null;
  }

  const parsed: unknown = JSON.parse(
    Buffer.from(cursor, "base64url").toString("utf8"),
  );

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Invalid search cursor: expected a JSON object");
  }

  if (!("s" in parsed && "m" in parsed && "i" in parsed)) {
    throw new Error(
      'Invalid search cursor: missing required keys "s", "m", or "i"',
    );
  }

  const s = parsed["s"];
  const m = parsed["m"];
  const i = parsed["i"];

  if (typeof s !== "number") {
    throw new Error('Invalid search cursor: "s" must be a number');
  }

  if (typeof m !== "string") {
    throw new Error('Invalid search cursor: "m" must be a string');
  }

  if (typeof i !== "string") {
    throw new Error('Invalid search cursor: "i" must be a string');
  }

  return { s, m, i };
};
