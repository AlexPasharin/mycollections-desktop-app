import { CamelCasePlugin, Kysely, PostgresDialect, sql } from "kysely";
import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";

import { EventEmitter } from "node:events";

import type { DB } from "@/types/db/database";

const pool = new Pool({
  connectionString: process.env["DATABASE_URL"],
});

const DBMessenger = new EventEmitter();

const noticeEvent = "DB notice";

pool.on("connect", (client) => {
  client.on("notice", ({ message }) => {
    DBMessenger.emit(noticeEvent, message);
  });
});

const client = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool,
  }),
  plugins: [new CamelCasePlugin()],
});

export default client;

const noticeMessageWithQueryIdRegEx = /^id:(?<queryId>[^:]+):(?<notice>.+)$/;

/**
 * Executes query given by queryBuilder function inside a transaction listening to notifications that DB raises with RAISE NOTICE
 * Assumes notifications we want to catch are constructed using "add_query_id" function defined in the database (see migration "20250806172817_artists_validation_trigger")
 *
 * @param queryBuilder function of kysely client that returns executable kysely query with result of type T
 * @returns result of query execution and array of caught notifications packed in an object
 */
export const withDBMessenger = async <T>(
  queryBuilder: (kyselyClient: Kysely<DB>) => { execute: () => Promise<T> },
): Promise<{ result: T; notifications: string[] }> => {
  const queryId = uuidv4();
  const notifications: string[] = [];

  const noticeListener = (msg?: string) => {
    const match = msg?.match(noticeMessageWithQueryIdRegEx);

    // to identify notifications that come from execution of this query
    if (match?.groups?.["queryId"] === queryId) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      notifications.push(match.groups["notice"] as string); // "as" assertion is safe by construction of regex
    }
  };

  DBMessenger.on(noticeEvent, noticeListener);

  const result = await client.transaction().execute(async (trx) => {
    await sql`SET app.query_id = ${sql.raw(`'${queryId}'`)}`.execute(trx);

    return queryBuilder(trx).execute();
  });

  DBMessenger.off(noticeEvent, noticeListener);

  return { result, notifications };
};
