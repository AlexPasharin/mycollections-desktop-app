import type { Kysely } from "kysely";

import { fetchEntryByIdResult } from "./entryById";

import { applyWithNotificationsFor } from "../client/kysely";

import type { DB } from "@/types/db/database";
import type {
  UpdateMusicalEntry,
  UpdateMusicalEntryAltNameInput,
} from "@/types/entries";

export const updateMusicalEntry: UpdateMusicalEntry = async (
  { entryId, entry, tagIds, typeIds, altNames },
  dbSource,
) => {
  const { results: updatedEntry, notifications } =
    await applyWithNotificationsFor(async (trx) => {
      await trx
        .updateTable("musicalEntries")
        .set(entry)
        .where("entryId", "=", entryId)
        .execute();

      await syncEntryTags(trx, entryId, tagIds);
      await syncEntryTypes(trx, entryId, typeIds);
      await syncEntryAltNames(trx, entryId, altNames);

      const entryAfterUpdate = await fetchEntryByIdResult(trx, entryId);

      if (!entryAfterUpdate) {
        throw new Error(`Entry "${entryId}" not found after update`);
      }

      return entryAfterUpdate;
    }, dbSource);

  return { entry: updatedEntry, notifications };
};

type DbTransaction = Kysely<DB>;

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
  altNames: UpdateMusicalEntryAltNameInput[],
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

const upsertEntryAltName = async (
  trx: DbTransaction,
  entryId: string,
  altName: UpdateMusicalEntryAltNameInput,
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
