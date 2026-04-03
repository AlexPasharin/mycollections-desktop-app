import { sql } from "kysely";

import client from "../client/kysely";
import { aggregateDistinctValuesToArray } from "../utils";

import type {
  GetReleaseById,
  ReleaseFormatOfReleaseItem,
} from "@/types/releases";
import {
  collectReleaseCountryCodes,
  countryCodesToNamesInReleaseCountries,
} from "@/utils/countries";
import { releaseCatNumbersSchema } from "@/validation/releases/catNumbers";
import { releaseCountriesSchema } from "@/validation/releases/countries";
import { releaseMatrixRunoutSchema } from "@/validation/releases/matrixRunout";

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

export const getReleaseById: GetReleaseById = async (releaseId) => {
  const release = await client
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
      aggregateDistinctValuesToArray("tags.tag", "tags"),
      sql<ReleaseFormatOfReleaseItem[]>`coalesce(
        jsonb_agg(DISTINCT jsonb_build_object(
          'id', ${sql.ref("formatsOfReleases.id")},
          'jukeboxHole', ${sql.ref("formatsOfReleases.jukeboxHole")},
          'pictureSleeve', ${sql.ref("formatsOfReleases.pictureSleeve")},
          'speed', ${sql.ref("formatsOfReleases.speed")},
          'amount', ${sql.ref("formatsOfReleases.amount")},
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

  const { countries, catalogueNumbers, matrixRunout, ...rest } = release;

  return {
    ...rest,
    countries: await getReleaseCountries(countries),
    catalogueNumbers: getReleaseCatNumbers(catalogueNumbers),
    matrixRunout: getReleaseMatrixRunout(matrixRunout),
  };
};

/** Parses and validates release countries JSON
 * In case validation is successful, returns the validated countries JSON with country codes replaced with their names
 * In case validation is not successful, returns the raw original JSON and the error message
 *
 * @param countries - the release countries JSON
 * @returns the validated countries JSON with country codes replaced with their names or the raw JSON and the error message
 */
const getReleaseCountries = async (countries: unknown) => {
  const countriesValidation = releaseCountriesSchema.safeParse(countries);

  if (!countriesValidation.success) {
    // SHOULD NOT NORMALLY HAPPEN BC OF TRIGGER ON MUSICAL_RELEASES TABLES
    return {
      rawJson: countries,
      error: "Could not be parsed to countries schema",
    };
  }

  const validated = countriesValidation.data;
  const countryCodes = collectReleaseCountryCodes(validated);

  const dbCountries =
    countryCodes.length === 0
      ? []
      : await client
          .selectFrom("countries")
          .where("codeName", "in", countryCodes)
          .selectAll()
          .execute();

  const codeToNameMap = new Map(
    dbCountries.map((c) => [c.codeName, c.name] as const),
  );

  try {
    return countryCodesToNamesInReleaseCountries(validated, codeToNameMap);
  } catch (caught) {
    const errorMessage =
      caught instanceof Error ? caught.message : String(caught);

    return {
      rawJson: countries,
      error: errorMessage,
    };
  }
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
