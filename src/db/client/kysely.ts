import { CamelCasePlugin, Kysely, PostgresDialect, sql } from "kysely";
import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";

import { EventEmitter } from "node:events";

import type { DB } from "@/types/db/database";

type DBQuery<T> = (kyselyClient: Kysely<DB>) => Promise<T>;

const createClient = (dbUrl: string) => {
  const pool = new Pool({
    connectionString: dbUrl,
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
    plugins: [new CamelCasePlugin({ maintainNestedObjectKeys: true })],
  });

  const noticeMessageWithQueryIdRegEx = /^id:(?<queryId>[^:]+):(?<notice>.+)$/;

  /**
   * Executes given queries (or one query) inside a transaction (in order given by array of queries) listening to notifications that DB raises with RAISE NOTICE
   * Also accepts just one query, which is treated as an array of one value only
   * Assumes notifications we want to catch are constructed using "add_query_id" function defined in the database (see migration "20250806172817_artists_validation_trigger")
   *
   * @param queries array of functions, each function takes kysely client and returns executable kysely query with result of type T. Alternatively can be a single function
   * @returns result of query execution and array of caught notifications packed in an object
   */
  const applyWithNotifications = async <T>(
    queryFn: DBQuery<T>,
  ): Promise<{ results: T; notifications: string[] }> => {
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

    const results = await client.transaction().execute(async (trx) => {
      await sql`SET app.query_id = ${sql.raw(`'${queryId}'`)}`.execute(trx);

      return await queryFn(trx);
    });

    DBMessenger.off(noticeEvent, noticeListener);

    return { results, notifications };
  };

  return { client, applyWithNotifications };
};

const { client, applyWithNotifications } = createClient(
  process.env["DATABASE_URL"] ?? "",
);

export { applyWithNotifications };

export default client;
