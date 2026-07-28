import type { Kysely } from "kysely";

import { fetchArtistByIdResult } from "./artistById";
import { insertRelatedArtists } from "./relatedArtists";

import { applyWithNotificationsFor } from "../client/kysely";

import type {
  ArtistAltNameInput,
  ArtistRelatedArtistInput,
  UpdateArtist,
} from "@/types/artists";
import type { DB } from "@/types/db/database";

export const updateArtist: UpdateArtist = async (
  { artistId, artist, altNames, relatedArtists },
  dbSource,
) => {
  const { results: updatedArtist, notifications } =
    await applyWithNotificationsFor(async (trx) => {
      await trx
        .updateTable("artists")
        .set(artist)
        .where("artistId", "=", artistId)
        .execute();

      await syncArtistAltNames(trx, artistId, altNames);
      await syncArtistRelatedArtists(trx, artistId, relatedArtists);

      const artistAfterUpdate = await fetchArtistByIdResult(trx, artistId);

      if (!artistAfterUpdate) {
        throw new Error(`Artist "${artistId}" not found after update`);
      }

      return artistAfterUpdate;
    }, dbSource);

  return { artist: updatedArtist, notifications };
};

type DbTransaction = Kysely<DB>;

const syncArtistAltNames = async (
  trx: DbTransaction,
  artistId: string,
  altNames: ArtistAltNameInput[],
) => {
  const providedNameIds = altNames
    .map((altName) => altName.nameId)
    .filter((nameId) => nameId !== undefined);

  let deleteQuery = trx
    .deleteFrom("alternativeArtistNames")
    .where("artistId", "=", artistId);

  if (providedNameIds.length > 0) {
    deleteQuery = deleteQuery.where("nameId", "not in", providedNameIds);
  }

  await deleteQuery.execute();

  const existingAltNames = await trx
    .selectFrom("alternativeArtistNames")
    .where("artistId", "=", artistId)
    .select("nameId")
    .execute();

  const existingNameIds = new Set(existingAltNames.map(({ nameId }) => nameId));

  for (const altName of altNames) {
    await upsertArtistAltName(trx, artistId, altName, existingNameIds);
  }
};

const upsertArtistAltName = async (
  trx: DbTransaction,
  artistId: string,
  altName: ArtistAltNameInput,
  existingNameIds: Set<string>,
) => {
  const { nameId, name } = altName;

  if (nameId !== undefined && existingNameIds.has(nameId)) {
    await trx
      .updateTable("alternativeArtistNames")
      .set({ name })
      .where("nameId", "=", nameId)
      .where("artistId", "=", artistId)
      .execute();

    return;
  }

  await trx
    .insertInto("alternativeArtistNames")
    .values({ nameId, name, artistId })
    .execute();
};

const syncArtistRelatedArtists = async (
  trx: DbTransaction,
  artistId: string,
  relatedArtists: ArtistRelatedArtistInput[],
) => {
  await trx
    .deleteFrom("parentArtists")
    .where((eb) =>
      eb.or([
        eb("parentArtistId", "=", artistId),
        eb("childArtistId", "=", artistId),
      ]),
    )
    .execute();

  await insertRelatedArtists(trx, artistId, relatedArtists);
};
