import { sql } from "kysely";

import { selectFromExtendedMusicalEntryRows } from "./utils";

import { dbClient } from "../client/kysely";
import { aggregateDistinctValuesToArray } from "../utils";

import type { DbSource } from "@/db/db-source";
import type { SearchArtistEntries } from "@/types/entries";

export const searchArtistEntries: SearchArtistEntries = async (
  { artistId, query, limit, cursor },
  dbSource,
) => {
  const subquery = buildEntriesQueryByNameSubstringMatch(query, dbSource);

  const cursorPayload = decodeCursor(cursor);
  const trimmedQuery = query.trim();

  let grouped = dbClient(dbSource)
    .selectFrom(subquery.as("entries"))

    .select([
      "entryId",
      "mainName",
      sql<number>`MAX(similarity)`.as("maxSimilarity"),

      // Aggregates types / alt names into jsonb string arrays; null filter + coalesce avoid `[null]` / SQL null.
      aggregateDistinctValuesToArray("type", "types"),
      aggregateDistinctValuesToArray("altName", "altNames"),
    ])

    .where("artistId", "=", artistId)
    .where((eb) =>
      eb.or([
        eb("mainName", "ilike", `%${trimmedQuery}%`),
        eb("altName", "ilike", `%${trimmedQuery}%`),
      ]),
    )

    .groupBy(["entryId", "mainName"])

    .orderBy(sql`MAX(similarity)`, "desc")
    .orderBy("mainName", "asc")
    .orderBy("entryId", "asc")

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
const buildEntriesQueryByNameSubstringMatch = (
  query: string,
  dbSource?: DbSource,
) => {
  const trimmedQuery = query.trim();

  return selectFromExtendedMusicalEntryRows(dbSource)
    .select([
      "musicalEntries.entryId as entryId",
      "musicalEntriesArtists.artistId as artistId",
      "musicalEntries.mainName as mainName",
      "alternativeMusicalEntryNames.name as altName",
      "musicalEntryTypes.name as type",
    ])
    .select(
      sql<number>`GREATEST(similarity(lower(${sql.ref("musicalEntries.mainName")}), ${`%${trimmedQuery}%`}), coalesce(similarity(lower(${sql.ref("alternativeMusicalEntryNames.name")}), ${`%${trimmedQuery}%`}), 0))`.as(
        "similarity",
      ),
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
