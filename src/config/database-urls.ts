import { DbSource } from "@/db/db-source";

/** Literal env keys — required with {@link EnvironmentPlugin} in webpack.plugins.ts for packaged builds. */
const localDevDbUrl = process.env["LOCAL_DEV_DB_URL"]?.trim() ?? "";
const localProdDbUrl = process.env["LOCAL_PROD_DB_URL"]?.trim() ?? "";
const remoteProdDbUrl = process.env["REMOTE_PROD_DB_URL"]?.trim() ?? "";

const urlEntries = [
  ["LOCAL_DEV_DB_URL", localDevDbUrl],
  ["LOCAL_PROD_DB_URL", localProdDbUrl],
  ["REMOTE_PROD_DB_URL", remoteProdDbUrl],
] as const;

const failures = urlEntries.filter(([, value]) => !value);

if (failures.length > 0) {
  throw new Error(
    `Missing or empty database URL environment variable(s): ${failures.map(([key]) => key).join(", ")}.`,
  );
}

/** Validated Postgres connection URLs keyed by {@link DbSource}. */
export const dbUrlsByDbSource: Readonly<Record<DbSource, string>> = {
  [DbSource.LocalDevDb]: localDevDbUrl,
  [DbSource.LocalProdDb]: localProdDbUrl,
  [DbSource.RemoteProdDb]: remoteProdDbUrl,
};
