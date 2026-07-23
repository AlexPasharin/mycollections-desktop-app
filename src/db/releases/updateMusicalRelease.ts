import type { Insertable, Kysely } from "kysely";

import { insertReleaseRelatedReleases } from "./relatedReleases";
import { getReleaseById } from "./releaseById";

import { applyWithNotificationsFor } from "../client/kysely";
import { toJsonbParam } from "../utils";

import type { DB, FormatOfRelease } from "@/types/db/database";
import type {
  MusicalReleaseRelatedReleaseInput,
  UpdateMusicalRelease,
} from "@/types/releases";

export const updateMusicalRelease: UpdateMusicalRelease = async (
  { releaseId, release, formats, tagIds, relatedReleases },
  dbSource,
) => {
  const { notifications } = await applyWithNotificationsFor(async (trx) => {
    const releaseUpdate = { ...release };

    if (release.countries !== undefined) {
      releaseUpdate.countries = toJsonbParam(release.countries);
    }

    if (release.catalogueNumbers !== undefined) {
      releaseUpdate.catalogueNumbers = toJsonbParam(release.catalogueNumbers);
    }

    if (release.matrixRunout !== undefined) {
      releaseUpdate.matrixRunout = toJsonbParam(release.matrixRunout);
    }

    await trx
      .updateTable("musicalReleases")
      .set(releaseUpdate)
      .where("releaseId", "=", releaseId)
      .execute();

    await syncReleaseFormats(trx, releaseId, formats);
    await syncReleaseTags(trx, releaseId, tagIds);
    await syncReleaseRelatedReleases(trx, releaseId, relatedReleases);
  }, dbSource);

  const updatedRelease = await getReleaseById(releaseId, dbSource);

  if (!updatedRelease) {
    throw new Error(`Release "${releaseId}" not found after update`);
  }

  return { release: updatedRelease, notifications };
};

type DbTransaction = Kysely<DB>;

type ReleaseFormatInput = Omit<Insertable<FormatOfRelease>, "releaseId">;

const syncReleaseFormats = async (
  trx: DbTransaction,
  releaseId: string,
  formats: ReleaseFormatInput[],
) => {
  await trx
    .deleteFrom("formatsOfReleases")
    .where("releaseId", "=", releaseId)
    .execute();

  if (formats.length === 0) {
    return;
  }

  await trx
    .insertInto("formatsOfReleases")
    .values(formats.map((format) => ({ ...format, releaseId })))
    .execute();
};

const syncReleaseTags = async (
  trx: DbTransaction,
  releaseId: string,
  tagIds: string[],
) => {
  await trx
    .deleteFrom("musicalReleasesTags")
    .where("releaseId", "=", releaseId)
    .execute();

  if (tagIds.length === 0) {
    return;
  }

  await trx
    .insertInto("musicalReleasesTags")
    .values(tagIds.map((tagId) => ({ releaseId, tagId })))
    .execute();
};

const syncReleaseRelatedReleases = async (
  trx: DbTransaction,
  releaseId: string,
  relatedReleases: MusicalReleaseRelatedReleaseInput[],
) => {
  await trx
    .deleteFrom("parentMusicalReleases")
    .where((eb) =>
      eb.or([
        eb("parentReleaseId", "=", releaseId),
        eb("childReleaseId", "=", releaseId),
      ]),
    )
    .execute();

  await insertReleaseRelatedReleases(trx, releaseId, relatedReleases);
};
