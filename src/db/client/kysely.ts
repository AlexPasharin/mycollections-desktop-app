import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import type { DB } from "@/types/db/database";

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env["DATABASE_URL"],
  }),
});

const client = new Kysely<DB>({
  dialect,
  plugins: [new CamelCasePlugin()],
});

export default client;
