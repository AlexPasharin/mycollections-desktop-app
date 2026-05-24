import { DbSource } from "@/db/db-source";

const readDbUrl = (key: string) => process.env[key]?.trim() ?? "";

const localDevDbUrl = readDbUrl("LOCAL_DEV_DB_URL");
const localProdDbUrl = readDbUrl("LOCAL_PROD_DB_URL");
const remoteProdDbUrl = readDbUrl("REMOTE_PROD_DB_URL");

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
