import { DbSource } from "@/db/db-source";

export const DB_SOURCE_OPTIONS = [
  { value: DbSource.LocalDevDb, label: "Local dev" },
  { value: DbSource.LocalProdDb, label: "Local prod" },
  { value: DbSource.RemoteProdDb, label: "Remote prod" },
] as const;

export const ALL_DB_SOURCES = DB_SOURCE_OPTIONS.map((option) => option.value);

const labelByDbSource = new Map(
  DB_SOURCE_OPTIONS.map((option) => [option.value, option.label]),
);

export const dbSourceLabel = (source: DbSource): string =>
  labelByDbSource.get(source) ?? source;
