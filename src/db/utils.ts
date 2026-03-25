import { sql, type RawBuilder } from "kysely";

/** `fieldRef`: column name (qualified or not, depending on the query context), e.g. `"artists.name"`. */
export const similarityToQuery = (fieldRef: string, query: string) =>
  sql<number>`similarity(lower(${sql.ref(fieldRef)}), ${query})`;

/**
 * Aggregate distinct non-null values into a `jsonb` array, or `[]` when none.
 * Elements are ordered by ascending `fieldRef` (SQL `ORDER BY` on the same column as `DISTINCT`).
 * `fieldRef`: column or alias, e.g. `"musicalEntryTypes.name"` or `"type"`.
 */
export const aggregateDistinctValuesToArray = (
  fieldRef: string,
): RawBuilder<string[]> =>
  sql<string[]>`coalesce(
    jsonb_agg(DISTINCT ${sql.ref(fieldRef)} ORDER BY ${sql.ref(fieldRef)})
      FILTER (WHERE ${sql.ref(fieldRef)} IS NOT NULL),
    '[]'::jsonb
  )`;
