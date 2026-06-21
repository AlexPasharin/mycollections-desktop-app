import { applyWithNotificationsFor, dbClient } from "../client/kysely";

import type { CreateTag, FetchTags } from "@/types/tags";

export const fetchTags: FetchTags = (dbSource) =>
  dbClient(dbSource)
    .selectFrom("tags")
    .select(["tagId", "tag"])
    .orderBy("tag")
    .execute();

export const createTag: CreateTag = ({ tag, tagId }, dbSource) =>
  applyWithNotificationsFor(
    (trx) =>
      trx
        .insertInto("tags")
        .values(tagId === undefined ? { tag } : { tag, tagId })
        .returning(["tagId", "tag"])
        .executeTakeFirstOrThrow(),
    dbSource,
  ).then(({ results, notifications }) => ({
    tag: results,
    notifications,
  }));
