import { sql } from "kysely";

/** `fieldRef`: qualified column, e.g. `"artists.name"`. */
export const similarityToQuery = (fieldRef: string, query: string) =>
  sql<number>`similarity(lower(${sql.ref(fieldRef)}), ${query})`;
