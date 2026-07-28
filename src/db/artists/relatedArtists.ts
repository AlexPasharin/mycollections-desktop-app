import type { Kysely } from "kysely";

import { PARENT_RELATION } from "@/constants";
import type {
  ArtistRelatedArtistInput,
  RelatedArtistItem,
} from "@/types/artists";
import type { RelatedItemRelation } from "@/types/common";
import type { DB } from "@/types/db/database";

export const fetchRelatedArtists = (
  db: Kysely<DB>,
  artistId: string,
  relation: RelatedItemRelation,
): Promise<RelatedArtistItem[]> => {
  const isParentRelation = relation === PARENT_RELATION;

  const relatedArtistJoinColumn = isParentRelation
    ? "parentArtists.parentArtistId"
    : "parentArtists.childArtistId";

  const currentArtistFilterColumn = isParentRelation
    ? "parentArtists.childArtistId"
    : "parentArtists.parentArtistId";

  return db
    .selectFrom("parentArtists")
    .innerJoin("artists", relatedArtistJoinColumn, "artists.artistId")
    .where(currentArtistFilterColumn, "=", artistId)
    .select(["artists.artistId", "artists.name"])
    .orderBy("artists.name", "asc")
    .orderBy("artists.artistId", "asc")
    .execute();
};

export const insertRelatedArtists = async (
  trx: Kysely<DB>,
  artistId: string,
  relatedArtists: ArtistRelatedArtistInput[],
) => {
  if (relatedArtists.length === 0) {
    return;
  }

  const rows = relatedArtists.map(({ relatedArtistId, relation }) =>
    relation === PARENT_RELATION
      ? {
          parentArtistId: relatedArtistId,
          childArtistId: artistId,
        }
      : {
          parentArtistId: artistId,
          childArtistId: relatedArtistId,
        },
  );

  await trx.insertInto("parentArtists").values(rows).execute();
};
