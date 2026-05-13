import {
  sql,
  type AliasedRawBuilder,
  type ExpressionBuilder,
  type RawBuilder,
  type SelectQueryBuilder,
} from "kysely";

import type { DB } from "@/types/db/database";

export const toJsonbParam = (value: unknown): string | null =>
  value == null ? null : JSON.stringify(value);

/** For `.where(...)`: `similarity(lower(fieldRef), matchText) > 0`. */
export const hasSimilarityToText =
  <TB extends keyof DB>(fieldRef: string, matchText: string) =>
  (eb: ExpressionBuilder<DB, TB>) =>
    eb(similarityToText(fieldRef, matchText), ">", 0);

/** Appends an `orderBy` on `similarity(lower(fieldRef), matchText)` descending. */
export const orderBySimilarityToTextDesc = <TB extends keyof DB, O>(
  qb: SelectQueryBuilder<DB, TB, O>,
  fieldRef: string,
  matchText: string,
): SelectQueryBuilder<DB, TB, O> =>
  qb.orderBy(similarityToText(fieldRef, matchText), "desc");

/**
 * Aggregate distinct non-null values into a `jsonb` array, or `[]` when none.
 * Elements are ordered by ascending `fieldRef` (SQL `ORDER BY` on the same column as `DISTINCT`).
 * `fieldRef`: column or alias, e.g. `"musicalEntryTypes.name"` or `"type"`.
 * `alias`: when set, the expression is returned already aliased for `.select()` (same as trailing `.as(alias)`).
 */
export function aggregateDistinctValuesToArray(
  fieldRef: string,
): RawBuilder<string[]>;
export function aggregateDistinctValuesToArray<A extends string>(
  fieldRef: string,
  alias: A,
): AliasedRawBuilder<string[], A>;

export function aggregateDistinctValuesToArray(
  fieldRef: string,
  alias?: string,
): RawBuilder<string[]> | AliasedRawBuilder<string[], string> {
  const expr = sql<string[]>`coalesce(
    jsonb_agg(DISTINCT ${sql.ref(fieldRef)} ORDER BY ${sql.ref(fieldRef)})
      FILTER (WHERE ${sql.ref(fieldRef)} IS NOT NULL),
    '[]'::jsonb
  )`;

  return alias ? expr.as(alias) : expr;
}

/**
 * `fieldRef`: column name (qualified or not, depending on the query context), e.g. `"artists.name"`.
 * `matchText`: substring compared via `similarity()` (not an SQL query string).
 */
const similarityToText = (fieldRef: string, matchText: string) =>
  sql<number>`similarity(lower(${sql.ref(fieldRef)}), ${matchText})`;
