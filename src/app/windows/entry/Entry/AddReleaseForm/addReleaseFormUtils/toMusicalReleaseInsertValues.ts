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

export type ToMusicalReleaseInsertValuesArgs = {
  entry: AddReleaseFormEntry;
  name: AddReleaseFormNameInput;
  releaseVersion: string;
  releaseDate: GeneralizedDateFormInputValue;
  discogsUrl: string;
  countries: AddReleaseFormCountries;
  catalogueNumbers: AddReleaseFormCatNumbersInputs;
  matrixRunout: AddReleaseFormMatrixRunoutDraft;
  partOfQueenCollection: boolean;

  /**
   * Raw draft value as held in the form. The "relation to Queen" textarea is
   * only visible when `partOfQueenCollection` is on, but its value is kept
   * across toggles for UX, so this helper drops it whenever
   * `partOfQueenCollection` is off (the DB rejects the text otherwise).
   */
  relationToQueen: string;
  comment: string;
  conditionProblems: string;
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
  entryId: entry.entryId,
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

  // TODO: when the user typed a fresh alternative name (nameId === null but
  // text differs from the entry's main name), insert a new
  // `alternativeMusicalEntryNames` row in a transaction and use its id here.
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
const toReleaseDateString = (
  input: GeneralizedDateFormInputValue,
): string | null => {
  const year = input.year.trim();

  if (year === "") {
    return null;
  }

  const segments = [year];
  const month = input.month.trim();
  const day = input.day.trim();

  if (month !== "") {
    segments.push(month.padStart(2, "0"));
  }

  if (day !== "") {
    segments.push(day.padStart(2, "0"));
  }

  return segments.join("-");
};

/**
 * Maps the form's parallel made-in / printed-in arrays to the jsonb shape:
 * `null` when both are empty, a plain string for a single made-in country, an
 * array for many, or `{ "made in": ..., "printed in": ... }` when printed-in
 * is also set. The form does not produce the CD/slipcase variant.
 */
const toReleaseCountriesJson = (
  countries: AddReleaseFormCountries,
): unknown => {
  const madeIn = toCodeNamesJson(countries.madeIn);
  const printedIn = toCodeNamesJson(countries.printedIn);

  if (madeIn === null && printedIn === null) {
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
): string | string[] | null => {
  const codeNames = rows.map((row) => row.codeName);
  const [first, second] = codeNames;

  if (first === undefined) {
    return null;
  }

  if (second === undefined) {
    return first;
  }

  return codeNames;
};

/**
 * Maps the form's catalogue-number rows to the jsonb shape: `null` when there
 * are no rows, a single object for one row, or an array for many. Each row
 * picks `label` / `labels` and `cat_number` / `cat_numbers` keys based on
 * count, omitting either side when empty. The form does not produce the
 * Europe/UK or CD/slipcase nested variants.
 */
const toReleaseCatNumbersJson = (
  rows: AddReleaseFormCatNumbersInputs,
): unknown => {
  if (rows.length === 0) {
    return null;
  }

  const objects = rows.map(catNumberRowToJson);
  const [first, second] = objects;

  if (first === undefined) {
    return null;
  }

  if (second === undefined) {
    return first;
  }

  return objects;
};

const catNumberRowToJson = (
  row: CatalogueNumberRowState,
): Record<string, unknown> => {
  const labels = row.labelInputValues.map((entry) => entry.name);
  const catNumbers = row.catalogueNumberInputValues.map((entry) => entry.value);

  return {
    ...singleOrArrayEntry(labels, "label", "labels"),
    ...singleOrArrayEntry(catNumbers, "cat_number", "cat_numbers"),
  };
};

const singleOrArrayEntry = (
  values: string[],
  singularKey: string,
  pluralKey: string,
): Record<string, string | string[]> => {
  const [first, second] = values;

  if (first === undefined) {
    return {};
  }

  if (second === undefined) {
    return { [singularKey]: first };
  }

  return { [pluralKey]: values };
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
