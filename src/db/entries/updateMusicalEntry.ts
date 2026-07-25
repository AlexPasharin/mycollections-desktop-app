import type { Kysely } from "kysely";

import { fetchEntryByIdResult } from "./entryById";
import { insertEntryRelatedEntries } from "./relatedEntries";

import { applyWithNotificationsFor } from "../client/kysely";

import type { DB } from "@/types/db/database";
import type {
  MusicalEntryAltNameInput,
  MusicalEntryArtistInput,
  MusicalEntryRelatedEntryInput,
  UpdateMusicalEntry,
} from "@/types/entries";

export const updateMusicalEntry: UpdateMusicalEntry = async (
  { entryId, entry, artists, tagIds, typeIds, altNames, relatedEntries },
  dbSource,
) => {
  const { results: updatedEntry, notifications } =
    await applyWithNotificationsFor(async (trx) => {
      await trx
        .updateTable("musicalEntries")
        .set(entry)
        .where("entryId", "=", entryId)
        .execute();

      await syncEntryArtists(trx, entryId, artists);
      await syncEntryTags(trx, entryId, tagIds);
      await syncEntryTypes(trx, entryId, typeIds);
      await syncEntryAltNames(trx, entryId, altNames);
      await syncEntryRelatedEntries(trx, entryId, relatedEntries);

      const entryAfterUpdate = await fetchEntryByIdResult(trx, entryId);

      if (!entryAfterUpdate) {
        throw new Error(`Entry "${entryId}" not found after update`);
      }

      return entryAfterUpdate;
    }, dbSource);

  return { entry: updatedEntry, notifications };
};

type DbTransaction = Kysely<DB>;

const syncEntryArtists = async (
  trx: DbTransaction,
  entryId: string,
  artists: MusicalEntryArtistInput[],
) => {
  // the implementation below is fairly complicated instead of usual "remove all and insert new" approach
  // because we want to keep the entry artist alt name id if it is provided
  // this is because it is referenced by other tables (musicalReleaseAlternativeArtists

  const desiredArtists = artists.map(
    ({ artistId, entryArtistAltNameId, isEntriesMainArtist }) => ({
      artistId,
      entryArtistNameId: entryArtistAltNameId ?? null,
      isEntriesMainArtist,
    }),
  );

  const existingArtists = await trx
    .selectFrom("musicalEntriesArtists")
    .where("entryId", "=", entryId)
    .select(["id", "artistId", "entryArtistNameId", "isEntriesMainArtist"])
    .execute();

  const desiredByKey = new Map(
    desiredArtists.map((artist) => [
      entryArtistKey(artist.artistId, artist.entryArtistNameId),
      artist,
    ]),
  );
  const existingByKey = new Map(
    existingArtists.map((artist) => [
      entryArtistKey(artist.artistId, artist.entryArtistNameId),
      artist,
    ]),
  );

  const idsToDelete = existingArtists
    .filter(
      (artist) =>
        !desiredByKey.has(
          entryArtistKey(artist.artistId, artist.entryArtistNameId),
        ),
    )
    .map((artist) => artist.id);

  if (idsToDelete.length > 0) {
    await trx
      .deleteFrom("musicalEntriesArtists")
      .where("id", "in", idsToDelete)
      .execute();
  }

  const artistsToInsert: {
    entryId: string;
    artistId: string;
    entryArtistNameId: string | null;
    isEntriesMainArtist: boolean;
  }[] = [];

  for (const [key, desiredArtist] of desiredByKey) {
    const existingArtist = existingByKey.get(key);

    if (!existingArtist) {
      artistsToInsert.push({ entryId, ...desiredArtist });
      continue;
    }

    if (
      existingArtist.isEntriesMainArtist !== desiredArtist.isEntriesMainArtist
    ) {
      await trx
        .updateTable("musicalEntriesArtists")
        .set({ isEntriesMainArtist: desiredArtist.isEntriesMainArtist })
        .where("id", "=", existingArtist.id)
        .execute();
    }
  }

  if (artistsToInsert.length > 0) {
    await trx
      .insertInto("musicalEntriesArtists")
      .values(artistsToInsert)
      .execute();
  }
};

const entryArtistKey = (
  artistId: string,
  entryArtistNameId: string | null,
): string => JSON.stringify({ artistId, entryArtistNameId });

const syncEntryTags = async (
  trx: DbTransaction,
  entryId: string,
  tagIds: string[],
) => {
  await trx
    .deleteFrom("musicalEntriesTags")
    .where("entryId", "=", entryId)
    .execute();

  if (tagIds.length === 0) {
    return;
  }

  await trx
    .insertInto("musicalEntriesTags")
    .values(tagIds.map((tagId) => ({ entryId, tagId })))
    .execute();
};

const syncEntryTypes = async (
  trx: DbTransaction,
  entryId: string,
  typeIds: string[],
) => {
  await trx
    .deleteFrom("typesOfMusicalEntries")
    .where("entryId", "=", entryId)
    .execute();

  if (typeIds.length === 0) {
    return;
  }

  await trx
    .insertInto("typesOfMusicalEntries")
    .values(typeIds.map((typeId) => ({ entryId, typeId })))
    .execute();
};

const syncEntryAltNames = async (
  trx: DbTransaction,
  entryId: string,
  altNames: MusicalEntryAltNameInput[],
) => {
  const providedNameIds = altNames
    .map((altName) => altName.nameId)
    .filter((nameId) => nameId !== undefined);

  let deleteQuery = trx
    .deleteFrom("alternativeMusicalEntryNames")
    .where("entryId", "=", entryId);

  if (providedNameIds.length > 0) {
    deleteQuery = deleteQuery.where("nameId", "not in", providedNameIds);
  }

  await deleteQuery.execute();

  const existingAltNames = await trx
    .selectFrom("alternativeMusicalEntryNames")
    .where("entryId", "=", entryId)
    .select("nameId")
    .execute();

  const existingNameIds = new Set(existingAltNames.map(({ nameId }) => nameId));

  for (const altName of altNames) {
    await upsertEntryAltName(trx, entryId, altName, existingNameIds);
  }
};

const syncEntryRelatedEntries = async (
  trx: DbTransaction,
  entryId: string,
  relatedEntries: MusicalEntryRelatedEntryInput[],
) => {
  await trx
    .deleteFrom("parentMusicalEntries")
    .where((eb) =>
      eb.or([
        eb("parentEntryId", "=", entryId),
        eb("childEntryId", "=", entryId),
      ]),
    )
    .execute();

  await insertEntryRelatedEntries(trx, entryId, relatedEntries);
};

const upsertEntryAltName = async (
  trx: DbTransaction,
  entryId: string,
  altName: MusicalEntryAltNameInput,
  existingNameIds: Set<string>,
) => {
  const { nameId, name } = altName;

  if (nameId !== undefined && existingNameIds.has(nameId)) {
    await trx
      .updateTable("alternativeMusicalEntryNames")
      .set({ name })
      .where("nameId", "=", nameId)
      .where("entryId", "=", entryId)
      .execute();

    return;
  }

  await trx
    .insertInto("alternativeMusicalEntryNames")
    .values({ nameId, name, entryId })
    .execute();
};
