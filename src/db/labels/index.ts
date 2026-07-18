import { applyWithNotificationsFor, dbClient } from "../client/kysely";

import type { CreateLabel, FetchLabels } from "@/types/labels";

export const fetchLabels: FetchLabels = (dbSource) =>
  dbClient(dbSource)
    .selectFrom("labels")
    .select(["labelId", "name"])
    .orderBy("name")
    .execute();

export const createLabel: CreateLabel = ({ name, labelId }, dbSource) =>
  applyWithNotificationsFor(
    (trx) =>
      trx
        .insertInto("labels")
        .values(labelId === undefined ? { name } : { name, labelId })
        .returning(["labelId", "name"])
        .executeTakeFirstOrThrow(),
    dbSource,
  ).then(({ results, notifications }) => ({
    label: results,
    notifications,
  }));
