import { sql } from "kysely";

import { dbClient } from "../client/kysely";

import type {
  GetReleaseById,
  ReleaseByIdResult,
  ReleaseFormatOfReleaseItem,
} from "@/types/releases";
import type { TagListItem } from "@/types/tags";
import { parseStringAsGeneralizedDate } from "@/utils/date";
import {
  releaseCatNumbersSchema,
  releaseCountriesSchema,
  releaseMatrixRunoutSchema,
} from "@/validation";

const musicalReleaseColumns = [
  "musicalReleases.releaseId",
  "musicalReleases.releaseVersion",
  "musicalReleases.releaseDate",
  "musicalReleases.discogsUrl",
  "musicalReleases.countries",
  "musicalReleases.catalogueNumbers",
  "musicalReleases.matrixRunout",
  "musicalReleases.comment",
  "musicalReleases.conditionProblems",
  "musicalReleases.partOfQueenCollection",
  "musicalReleases.relationToQueen",
  "musicalReleases.entryId",
] as const;

export const getReleaseById: GetReleaseById = async (releaseId, dbSource) => {
  const release = await dbClient(dbSource)
    .selectFrom("musicalReleases")
    .leftJoin(
      "alternativeMusicalEntryNames",
      "musicalReleases.releaseAlternativeNameId",
      "alternativeMusicalEntryNames.nameId",
    )
    .leftJoin(
      "musicalReleasesTags",
      "musicalReleases.releaseId",
      "musicalReleasesTags.releaseId",
    )
    .leftJoin("tags", "musicalReleasesTags.tagId", "tags.tagId")
    .leftJoin(
      "formatsOfReleases",
      "musicalReleases.releaseId",
      "formatsOfReleases.releaseId",
    )
    .leftJoin(
      "releasesFormats",
      "formatsOfReleases.formatId",
      "releasesFormats.formatId",
    )
    .where("musicalReleases.releaseId", "=", releaseId)
    .select([
      ...musicalReleaseColumns,
      "alternativeMusicalEntryNames.name as alternativeName",
      sql<TagListItem[]>`coalesce(
        jsonb_agg(DISTINCT jsonb_build_object(
          'tagId', ${sql.ref("tags.tagId")},
          'tag', ${sql.ref("tags.tag")}
        )) FILTER (WHERE ${sql.ref("tags.tagId")} IS NOT NULL),
        '[]'::jsonb
      )`.as("tags"),
      sql<ReleaseFormatOfReleaseItem[]>`coalesce(
        jsonb_agg(DISTINCT jsonb_build_object(
          'id', ${sql.ref("formatsOfReleases.id")},
          'jukeboxHole', ${sql.ref("formatsOfReleases.jukeboxHole")},
          'pictureSleeve', ${sql.ref("formatsOfReleases.pictureSleeve")},
          'speed', ${sql.ref("formatsOfReleases.speed")},
          'amount', ${sql.ref("formatsOfReleases.amount")},
          'formatId', ${sql.ref("releasesFormats.formatId")},
          'shortName', ${sql.ref("releasesFormats.shortName")}
        )) FILTER (WHERE ${sql.ref("formatsOfReleases.id")} IS NOT NULL),
        '[]'::jsonb
      )`.as("formats"),
    ])
    .groupBy([...musicalReleaseColumns, "alternativeMusicalEntryNames.name"])
    .executeTakeFirst();

  if (!release) {
    return release;
  }

  const { countries, catalogueNumbers, matrixRunout, releaseDate, ...rest } =
    release;

  return {
    ...rest,
    releaseDate: parseStringAsGeneralizedDate(releaseDate),
    countries: getReleaseCountries(countries),
    catalogueNumbers: getReleaseCatNumbers(catalogueNumbers),
    matrixRunout: getReleaseMatrixRunout(matrixRunout),
  };
};

/** Parses and validates release countries JSON.
 * On success returns the validated value (country codes); on failure returns the raw JSON and an error message.
 */
const getReleaseCountries = (
  countries: unknown,
): ReleaseByIdResult["countries"] => {
  const countriesValidation = releaseCountriesSchema.safeParse(countries);

  if (!countriesValidation.success) {
    // SHOULD NOT NORMALLY HAPPEN BC OF TRIGGER ON MUSICAL_RELEASES TABLES
    return {
      rawJson: countries,
      error: "Could not be parsed to countries schema",
    };
  }

  return countriesValidation.data;
};

/** Parses and validates release catalogue numbers JSON
 * On success returns the validated value; on failure returns the raw JSON and an error message.
 */
const getReleaseCatNumbers = (catalogueNumbers: unknown) => {
  const validation = releaseCatNumbersSchema.safeParse(catalogueNumbers);

  if (!validation.success) {
    // SHOULD NOT NORMALLY HAPPEN BC OF TRIGGER ON MUSICAL_RELEASES TABLES
    return {
      rawJson: catalogueNumbers,
      error: "Could not be parsed to catalogue numbers schema",
    };
  }

  return validation.data;
};

/** Parses and validates release matrix / runout JSON
 * On success returns the validated value; on failure returns the raw JSON and an error message.
 */
const getReleaseMatrixRunout = (matrixRunout: unknown) => {
  const validation = releaseMatrixRunoutSchema.safeParse(matrixRunout);

  if (!validation.success) {
    // SHOULD NOT NORMALLY HAPPEN BC OF TRIGGER ON MUSICAL_RELEASES TABLES
    return {
      rawJson: matrixRunout,
      error: "Could not be parsed to matrix / runout schema",
    };
  }

  return validation.data;
};
