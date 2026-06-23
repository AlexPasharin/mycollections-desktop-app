import { fetchEntryByIdResult } from "./entryById";

import { applyWithNotificationsFor } from "../client/kysely";

import type { CreateMusicalEntry } from "@/types/entries";

export const createMusicalEntry: CreateMusicalEntry = async (
  { entry, tagIds, typeIds, altNames, artistId },
  dbSource,
) => {
  const { results: createdEntry, notifications } =
    await applyWithNotificationsFor(async (trx) => {
      const { entryId } = await trx
        .insertInto("musicalEntries")
        .values(entry)
        .returning("entryId")
        .executeTakeFirstOrThrow();

      await trx
        .insertInto("musicalEntriesArtists")
        .values({ entryId, artistId, isEntriesMainArtist: true })
        .execute();

      if (tagIds.length > 0) {
        await trx
          .insertInto("musicalEntriesTags")
          .values(tagIds.map((tagId) => ({ entryId, tagId })))
          .execute();
      }

      if (typeIds.length > 0) {
        await trx
          .insertInto("typesOfMusicalEntries")
          .values(typeIds.map((typeId) => ({ entryId, typeId })))
          .execute();
      }

      if (altNames.length > 0) {
        await trx
          .insertInto("alternativeMusicalEntryNames")
          .values(
            altNames.map(({ nameId, name }) => ({ nameId, name, entryId })),
          )
          .execute();
      }

      const entryAfterCreate = await fetchEntryByIdResult(trx, entryId);

      if (!entryAfterCreate) {
        throw new Error(`Entry "${entryId}" not found after create`);
      }

      return entryAfterCreate;
    }, dbSource);

  return { entry: createdEntry, notifications };
};
