import { fetchArtistByIdResult } from "./artistById";

import { applyWithNotificationsFor } from "../client/kysely";

import type { CreateArtist } from "@/types/artists";

export const createArtist: CreateArtist = async (
  { artist, altNames },
  dbSource,
) => {
  const { results: createdArtist, notifications } =
    await applyWithNotificationsFor(async (trx) => {
      const { artistId } = await trx
        .insertInto("artists")
        .values(artist)
        .returning("artistId")
        .executeTakeFirstOrThrow();

      if (altNames.length > 0) {
        await trx
          .insertInto("alternativeArtistNames")
          .values(
            altNames.map(({ nameId, name }) => ({ nameId, name, artistId })),
          )
          .execute();
      }

      const artistAfterCreate = await fetchArtistByIdResult(trx, artistId);

      if (!artistAfterCreate) {
        throw new Error(`Artist "${artistId}" not found after create`);
      }

      return artistAfterCreate;
    }, dbSource);

  return { artist: createdArtist, notifications };
};
