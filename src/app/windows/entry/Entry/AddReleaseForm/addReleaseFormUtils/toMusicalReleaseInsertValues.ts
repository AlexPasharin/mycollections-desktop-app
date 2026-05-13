import type { Insertable } from "kysely";

import type {
  AddReleaseFormCatNumbersInputs,
  AddReleaseFormCountries,
  AddReleaseFormEntry,
  AddReleaseFormMatrixRunoutDraft,
  AddReleaseFormNameInput,
  CatalogueNumberRowState,
  CountrySelectionInput,
} from "./formValues";

import type { GeneralizedDateFormInputValue } from "@/app/components/GeneralizedDateFormInput";
import type { MusicalRelease } from "@/types/db/database";

type ToMusicalReleaseInsertValuesArgs = {
  name: AddReleaseFormNameInput;
  releaseVersion: string;
  releaseDate: GeneralizedDateFormInputValue;
  discogsUrl: string;
  countries: AddReleaseFormCountries;
  catalogueNumbers: AddReleaseFormCatNumbersInputs;
  matrixRunout: AddReleaseFormMatrixRunoutDraft;
  partOfQueenCollection: boolean;
  relationToQueen: string;
  comment: string;
  conditionProblems: string;
  entry: AddReleaseFormEntry;
};

/**
 * Build the values for a `musicalReleases` insert from validated form fields.
 *
 * Assumes the caller has already validated every field; in particular this
 * trusts the release date / matrix-runout drafts to be parseable, and the
 * countries / catalogue-numbers shapes to satisfy their validators.
 *
 * Related rows (formats, tags, alt artists, newly-typed alt names) are not
 * handled here — only the row in `musicalReleases` itself.
 */
export const toMusicalReleaseInsertValues = ({
  entry,
  name,
  releaseVersion,
  releaseDate,
  discogsUrl,
  countries,
  catalogueNumbers,
  matrixRunout,
  partOfQueenCollection,
  relationToQueen,
  comment,
  conditionProblems,
}: ToMusicalReleaseInsertValuesArgs): Insertable<MusicalRelease> => ({
  releaseVersion,
  releaseDate: toReleaseDateString(releaseDate),
  discogsUrl: nullIfEmpty(discogsUrl),
  countries: toReleaseCountriesJson(countries),
  catalogueNumbers: toReleaseCatNumbersJson(catalogueNumbers),
  matrixRunout: toReleaseMatrixRunoutJson(matrixRunout),
  comment: nullIfEmpty(comment),
  conditionProblems: nullIfEmpty(conditionProblems),
  partOfQueenCollection,
  relationToQueen: partOfQueenCollection ? nullIfEmpty(relationToQueen) : null,
  entryId: entry.entryId,
  releaseAlternativeNameId: name.nameId,
});

const nullIfEmpty = (value: string): string | null => {
  const trimmed = value.trim();

  return trimmed === "" ? null : trimmed;
};

/**
 * Joins the form's `{ year, month, day }` strings into the DB string shape:
 * `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` with month and day zero-padded to 2
 * digits. Returns `null` when year is blank.
 *
 * Trusts the caller to have validated the input — empty month with a non-empty
 * day, leading zeros, etc. would otherwise produce a malformed string.
 */
export const toReleaseDateString = ({
  year,
  month,
  day,
}: GeneralizedDateFormInputValue): string | null => {
  const yearTrimmed = year.trim();

  if (yearTrimmed === "") {
    return null;
  }

  const segments = [yearTrimmed];
  const monthTrimmed = month.trim();
  const dayTrimmed = day.trim();

  if (monthTrimmed !== "") {
    segments.push(monthTrimmed.padStart(2, "0"));
  }

  if (dayTrimmed !== "") {
    segments.push(dayTrimmed.padStart(2, "0"));
  }

  return segments.join("-");
};

/**
 * Maps the form's parallel made-in / printed-in arrays to the jsonb shape:
 * `null` when both are empty, a plain string for a single made-in country, an
 * array for many, or `{ "made in": ..., "printed in": ... }` when printed-in
 * is also set. The form does not produce the CD/slipcase variant.
 */
export const toReleaseCountriesJson = (countries: AddReleaseFormCountries) => {
  const madeIn = toCodeNamesJson(countries.madeIn);
  const printedIn = toCodeNamesJson(countries.printedIn);

  if (madeIn === null) {
    return null;
  }

  if (printedIn === null) {
    return madeIn;
  }

  // The validator guarantees `madeIn` is non-empty whenever `printedIn` is set,
  // so the object form is well-formed.
  return { "made in": madeIn, "printed in": printedIn };
};

const toCodeNamesJson = (
  rows: CountrySelectionInput[],
): string | string[] | null =>
  singleOrArrayOrNull(rows.map((row) => row.codeName));

/**
 * Maps the form's catalogue-number rows to the jsonb shape: `null` when there
 * are no rows (or every row is empty), a single object for one row, or an
 * array for many. Each row picks `label` / `labels` keys based on count, and
 * its cat-number side is shaped by `row.shape`:
 *
 * - "flat" rows pick `cat_number` / `cat_numbers: string | string[]`, omitting
 *   the cat-number side entirely when no values are filled in;
 * - "europeUk" rows always emit `cat_numbers: { "in Europe", "in UK" }` (both
 *   sides guaranteed non-empty by the validator).
 *
 * Rows that would produce `{}` are dropped. The form does not produce the
 * CD/slipcase nested variant.
 */
export const toReleaseCatNumbersJson = (rows: AddReleaseFormCatNumbersInputs) =>
  singleOrArrayOrNull(
    rows.map(catNumberRowToJson).filter((row) => Object.keys(row).length > 0),
  );

const catNumberRowToJson = (row: CatalogueNumberRowState) => {
  const labels = collectNonEmptyValues(
    row.labelInputValues.map((entry) => entry.name),
  );
  const labelEntry = singleOrArrayEntry(labels, "label");

  if (row.shape === "flat") {
    const catNumbers = collectNonEmptyValues(
      row.catalogueNumberInputValues.map((entry) => entry.value),
    );

    return {
      ...labelEntry,
      ...singleOrArrayEntry(catNumbers, "cat_number"),
    };
  }

  const europe = collectNonEmptyValues(
    row.europeCatalogueNumberInputValues.map((entry) => entry.value),
  );
  const uk = collectNonEmptyValues(
    row.ukCatalogueNumberInputValues.map((entry) => entry.value),
  );

  const europeJson = singleOrArrayOrNull(europe);
  const ukJson = singleOrArrayOrNull(uk);

  if (europeJson === null || ukJson === null) {
    // Validator forbids this; falling back to labels-only keeps the row
    // structurally valid against the DB schema if it somehow slips through.
    return labelEntry;
  }

  return {
    ...labelEntry,
    cat_numbers: { "in Europe": europeJson, "in UK": ukJson },
  };
};

// Trims each value and drops empties so a stray placeholder input (e.g. the
// default empty cat-number slot the user left untouched on a labels-only row)
// doesn't leak into the JSON.
const collectNonEmptyValues = (values: string[]): string[] => {
  const result: string[] = [];

  for (const value of values) {
    const trimmed = value.trim();

    if (trimmed.length > 0) {
      result.push(trimmed);
    }
  }

  return result;
};

const singleOrArrayEntry = (
  values: string[],
  key: string,
): Record<string, string | string[]> => {
  const collapsed = singleOrArrayOrNull(values);

  if (collapsed === null) {
    return {};
  }

  if (typeof collapsed === "string") {
    return { [key]: collapsed };
  }

  const pluralKey = `${key}s`;

  return { [pluralKey]: collapsed };
};

/**
 * Maps the matrix/runout draft to the jsonb shape: `null` when the value is
 * empty, a plain string when treated as text, otherwise the parsed JSON
 * value. Trusts that the form has already validated the draft, so `JSON.parse`
 * is safe here.
 */
const toReleaseMatrixRunoutJson = (
  draft: AddReleaseFormMatrixRunoutDraft,
): unknown => {
  const trimmed = draft.value.trim();

  if (trimmed === "") {
    return null;
  }

  if (draft.treatAsText) {
    return trimmed;
  }

  return JSON.parse(trimmed);
};

/**
 * Collapses a list to the jsonb single/array shape:
 * `null` when empty, the single element when there is exactly one, or the
 * whole array otherwise.
 */
const singleOrArrayOrNull = <T>(items: T[]): T | T[] | null => {
  const [first, second] = items;

  if (first === undefined) {
    return null;
  }

  if (second === undefined) {
    return first;
  }

  return items;
};
