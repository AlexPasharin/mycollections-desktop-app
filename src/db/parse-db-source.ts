import { DbSource, DEFAULT_DB_SOURCE } from "@/db/db-source";

const dbSourceValues = new Set<string>(Object.values(DbSource));

const isDbSource = (value: string): value is DbSource =>
  dbSourceValues.has(value);

export const parseDbSource = (value: string | null): DbSource =>
  value !== null && isDbSource(value) ? value : DEFAULT_DB_SOURCE;
