import { fetchEntryByIdResult } from "./entryById";
import { insertEntryRelatedEntries } from "./relatedEntries";

import { applyWithNotificationsFor } from "../client/kysely";

import type { CreateMusicalEntry } from "@/types/entries";

export const createMusicalEntry: CreateMusicalEntry = async (
  { entry, artists, tagIds, typeIds, altNames, relatedEntries },
  dbSource,
) => {
  const { results: createdEntry, notifications } =
    await applyWithNotificationsFor(async (trx) => {
      const { entryId } = await trx
        .insertInto("musicalEntries")
        .values(entry)
        .returning("entryId")
        .executeTakeFirstOrThrow();

      if (artists.length > 0) {
        await trx
          .insertInto("musicalEntriesArtists")
          .values(
            artists.map(
              ({ artistId, entryArtistAltNameId, isEntriesMainArtist }) => ({
                entryId,
                artistId,
                entryArtistNameId: entryArtistAltNameId ?? null,
                isEntriesMainArtist,
              }),
            ),
          )
          .execute();
      }

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

      await insertEntryRelatedEntries(trx, entryId, relatedEntries);

      const entryAfterCreate = await fetchEntryByIdResult(trx, entryId);

      if (!entryAfterCreate) {
        throw new Error(`Entry "${entryId}" not found after create`);
      }

      return entryAfterCreate;
    }, dbSource);

  return { entry: createdEntry, notifications };
};
