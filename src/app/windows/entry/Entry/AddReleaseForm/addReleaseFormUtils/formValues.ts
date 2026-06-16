import {
  initialAddReleaseFormFieldErrors,
  type AddReleaseFormCatNumbersErrors,
  type AddReleaseFormCountriesErrors,
  type AddReleaseFormFormatErrors,
} from "./errorMessages";
import {
  validateDiscogsUrl,
  validateReleaseCountries,
  validateReleaseFormats,
  validateReleaseCatNumbers,
  validateReleaseMatrixRunout,
} from "./validation";

import type { GeneralizedDateFormInputValue } from "@/app/components/GeneralizedDateFormInput";
import type { DbSource } from "@/db/db-source";
import { ALL_DB_SOURCES } from "@/db/db-source-options";
import type { CountryListItem } from "@/types/countries";
import type { GeneralizedDate, GeneralizedDateFromDb } from "@/types/date";
import type { EntryAltNameInfo, EntryByIdResult } from "@/types/entries";
import type { FormField } from "@/types/form";
import type { ReleasesFormatListItem } from "@/types/formats";
import type {
  JsonParsingErrorData,
  ReleaseByIdResult,
  ReleaseFormatOfReleaseItem,
} from "@/types/releases";
import type { TagId } from "@/types/tags";
import { flattenStringOrArray } from "@/utils/common";
import { withNewId } from "@/utils/id";
import {
  validateOptionalTrimmedText,
  validatePassThrough,
  validateReleaseDate,
  validateRequiredTrimmedText,
  type CatNumbersProperty,
  type ReleaseCatNumbersSingle,
} from "@/validation";

export type AddReleaseFormNameInput = Omit<EntryAltNameInfo, "nameId"> & {
  nameId: string | null;
};

export const defaultNameInput = (name: string): AddReleaseFormNameInput => ({
  nameId: null,
  name,
});

export type AddReleaseFormEntry = Omit<
  EntryByIdResult,
  "originalReleaseDate"
> & {
  originalReleaseDate: GeneralizedDate | null;
};

export type AddReleaseFormFormatInput = {
  id: string;
  formatId: string;
  amount: string;
  pictureSleeve: boolean;
  jukeboxHole: boolean;
};

export const defaultFormatInputRow = (): AddReleaseFormFormatInput =>
  withNewId({
    formatId: "",
    amount: "1",
    pictureSleeve: true,
    jukeboxHole: false,
  });

export const emptyCatalogueNumberInputValue = (): CatalogueNumberInputValue =>
  withNewId({ value: "" });

export type CountrySelectionInput = {
  id: string;
  codeName: string;
};

export type AddReleaseFormCountries = {
  madeIn: CountrySelectionInput[];
  printedIn: CountrySelectionInput[];
};

export const emptyCountrySelection = (): CountrySelectionInput =>
  withNewId({ codeName: "" });

export type CatalogueNumberInputValue = { id: string; value: string };
export type LabelInputValue = { id: string; name: string };

export type CatalogueNumberRowShape = "flat" | "europeUk";

export type CatalogueNumberRowStateFlat = {
  id: string;
  shape: "flat";
  labelInputValues: LabelInputValue[];
  catalogueNumberInputValues: CatalogueNumberInputValue[];
};

export type CatalogueNumberRowStateEuropeUk = {
  id: string;
  shape: "europeUk";
  labelInputValues: LabelInputValue[];
  europeCatalogueNumberInputValues: CatalogueNumberInputValue[];
  ukCatalogueNumberInputValues: CatalogueNumberInputValue[];
};

export type CatalogueNumberRowState =
  | CatalogueNumberRowStateFlat
  | CatalogueNumberRowStateEuropeUk;

export const emptyLabelInputValue = (): LabelInputValue =>
  withNewId({ name: "" });

export const defaultCatalogueNumberRow = (): CatalogueNumberRowStateFlat =>
  withNewId({
    shape: "flat",
    labelInputValues: [emptyLabelInputValue()],
    catalogueNumberInputValues: [emptyCatalogueNumberInputValue()],
  });

// flat → europeUk: keep labels, move existing flat values into "in Europe",
// seed "in UK" with one empty input so the user has somewhere to type. If the
// flat row had no catalogue numbers at all, seed "in Europe" with an empty
// input too — both regions are required in europeUk shape.
export const toEuropeUkRow = (
  row: CatalogueNumberRowState,
): CatalogueNumberRowStateEuropeUk => {
  if (row.shape === "europeUk") {
    return row;
  }

  return {
    id: row.id,
    shape: "europeUk",
    labelInputValues: row.labelInputValues,
    europeCatalogueNumberInputValues:
      row.catalogueNumberInputValues.length > 0
        ? row.catalogueNumberInputValues
        : [emptyCatalogueNumberInputValue()],
    ukCatalogueNumberInputValues: [emptyCatalogueNumberInputValue()],
  };
};

// europeUk → flat: keep labels, concatenate europe then UK values into a single
// flat list, preserving ids so React keys and per-input errors survive the
// transition.
export const toFlatRow = (
  row: CatalogueNumberRowState,
): CatalogueNumberRowStateFlat => {
  if (row.shape === "flat") {
    return row;
  }

  return {
    id: row.id,
    shape: "flat",
    labelInputValues: row.labelInputValues,
    catalogueNumberInputValues: [
      ...row.europeCatalogueNumberInputValues,
      ...row.ukCatalogueNumberInputValues,
    ],
  };
};

export type AddReleaseFormMatrixRunoutDraft = {
  value: string;
  treatAsText: boolean;
};

export type AddReleaseFormFormatInputs = AddReleaseFormFormatInput[];
export type AddReleaseFormCatNumbersInputs = CatalogueNumberRowState[];

export type AddReleaseFormDraft = {
  name: FormField<AddReleaseFormNameInput>;
  releaseVersion: FormField;
  discogsUrl: FormField;
  releaseDate: FormField<GeneralizedDateFormInputValue>;
  countries: FormField<AddReleaseFormCountries, AddReleaseFormCountriesErrors>;
  formats: FormField<AddReleaseFormFormatInputs, AddReleaseFormFormatErrors>;
  catalogueNumbers: FormField<
    AddReleaseFormCatNumbersInputs,
    AddReleaseFormCatNumbersErrors
  >;
  matrixRunout: FormField<AddReleaseFormMatrixRunoutDraft>;
  selectedTags: FormField<Set<TagId>>;
  partOfQueenCollection: FormField<boolean>;
  relationToQueen: FormField<string>;
  comment: FormField<string>;
  conditionProblems: FormField<string>;
  dbSources: FormField<ReadonlySet<DbSource>>;
};

export type AddReleaseFormTabData = {
  releaseBlueprint: ReleaseByIdResult;
  dbSources?: ReadonlySet<DbSource> | undefined;
};

export const initialAddReleaseFormDraftValue = ({
  entry,
  allFormats,
  allCountries,
  tabData,
}: {
  entry: AddReleaseFormEntry;
  allFormats: ReleasesFormatListItem[];
  allCountries: CountryListItem[];
  tabData?: AddReleaseFormTabData | undefined;
}): AddReleaseFormDraft => {
  const { releaseBlueprint, dbSources } = tabData ?? {};

  return {
    releaseVersion: {
      value: releaseBlueprint?.releaseVersion ?? "",
      valid: true,
      validationFn: validateRequiredTrimmedText("Release version is required."),
      errors: initialAddReleaseFormFieldErrors.releaseVersion,
      notifications: [],
    },
    name: {
      value: resolveNameInput(entry, releaseBlueprint),
      valid: true,
      validationFn: validatePassThrough,
      errors: initialAddReleaseFormFieldErrors.name,
      notifications: [],
    },
    discogsUrl: {
      value:
        releaseBlueprint?.discogsUrl ??
        "https://www.discogs.com/release/<id>-...",
      valid: true,
      validationFn: validateDiscogsUrl,
      errors: initialAddReleaseFormFieldErrors.discogsUrl,
      notifications: [],
    },
    releaseDate: {
      value: releaseDateToFormValue(
        releaseBlueprint?.releaseDate ?? entry.originalReleaseDate,
      ),
      valid: true,
      validationFn: validateReleaseDate(entry.originalReleaseDate),
      errors: initialAddReleaseFormFieldErrors.releaseDate,
      notifications: [],
    },
    countries: {
      value: countriesToFormValue(releaseBlueprint?.countries, allCountries),
      valid: true,
      validationFn: validateReleaseCountries,
      errors: initialAddReleaseFormFieldErrors.countries,
      notifications: [],
    },
    formats: {
      value: formatsToFormValue(releaseBlueprint?.formats, allFormats),
      valid: true,
      validationFn: validateReleaseFormats(allFormats),
      errors: initialAddReleaseFormFieldErrors.formats,
      notifications: [],
    },
    catalogueNumbers: {
      value: catNumbersToFormValue(releaseBlueprint?.catalogueNumbers),
      valid: true,
      validationFn: validateReleaseCatNumbers,
      errors: initialAddReleaseFormFieldErrors.catalogueNumbers,
      notifications: [],
    },
    matrixRunout: {
      value: matrixRunoutToFormValue(releaseBlueprint?.matrixRunout),
      valid: true,
      validationFn: validateReleaseMatrixRunout,
      errors: initialAddReleaseFormFieldErrors.matrixRunout,
      notifications: [],
    },
    selectedTags: {
      value: new Set<string>(
        releaseBlueprint?.tags.map((tag) => tag.tagId) ?? [],
      ),
      valid: true,
      validationFn: validatePassThrough,
      errors: initialAddReleaseFormFieldErrors.selectedTags,
      notifications: [],
    },
    partOfQueenCollection: {
      value:
        releaseBlueprint?.partOfQueenCollection ?? entry.partOfQueenCollection,
      valid: true,
      validationFn: validatePassThrough,
      errors: initialAddReleaseFormFieldErrors.partOfQueenCollection,
      notifications: [],
    },
    relationToQueen: {
      value: releaseBlueprint?.relationToQueen ?? "",
      valid: true,
      validationFn: validateOptionalTrimmedText,
      errors: initialAddReleaseFormFieldErrors.relationToQueen,
      notifications: [],
    },
    comment: {
      value: releaseBlueprint?.comment ?? "",
      valid: true,
      validationFn: validateOptionalTrimmedText,
      errors: initialAddReleaseFormFieldErrors.comment,
      notifications: [],
    },
    conditionProblems: {
      value: releaseBlueprint?.conditionProblems ?? "",
      valid: true,
      validationFn: validateOptionalTrimmedText,
      errors: initialAddReleaseFormFieldErrors.conditionProblems,
      notifications: [],
    },
    dbSources: {
      value: dbSources ?? (new Set(ALL_DB_SOURCES) as ReadonlySet<DbSource>),
      valid: true,
      validationFn: validatePassThrough,
      errors: initialAddReleaseFormFieldErrors.dbSources,
      notifications: [],
    },
  };
};

const buildCountryLookup = (allCountries: CountryListItem[]) => {
  const codeNames = new Set(allCountries.map((country) => country.codeName));

  return (values: string[]): CountrySelectionInput[] =>
    values
      .filter((value) => codeNames.has(value))
      .map((codeName) => withNewId({ codeName }));
};

const resolveNameInput = (
  entry: AddReleaseFormEntry,
  release: ReleaseByIdResult | undefined,
): AddReleaseFormNameInput => {
  const alternativeName = release?.alternativeName;

  const matchedAltName = alternativeName
    ? entry.altNames.find((altName) => altName.name === alternativeName)
    : null;

  return matchedAltName
    ? { nameId: matchedAltName.nameId, name: matchedAltName.name }
    : defaultNameInput(entry.mainName);
};

const releaseDateToFormValue = (
  releaseDate: GeneralizedDateFromDb,
): GeneralizedDateFormInputValue => {
  if (releaseDate === null || "error" in releaseDate) {
    return { year: "", month: "", day: "" };
  }

  return {
    year: String(releaseDate.year ?? ""),
    month: String(releaseDate.month ?? ""),
    day: String(releaseDate.day ?? ""),
  };
};

const countriesToFormValue = (
  countries: ReleaseByIdResult["countries"] | undefined,
  allCountries: CountryListItem[],
): AddReleaseFormCountries => {
  if (countries == null || isCountriesJsonParsingError(countries)) {
    return { madeIn: [emptyCountrySelection()], printedIn: [] };
  }

  const basic =
    typeof countries === "object" && "CD" in countries
      ? countries.CD
      : countries;

  const countryLookup = buildCountryLookup(allCountries);

  if (typeof basic === "string" || Array.isArray(basic)) {
    const madeIn = countryLookup(flattenStringOrArray(basic));

    return {
      madeIn: madeIn.length > 0 ? madeIn : [emptyCountrySelection()],
      printedIn: [],
    };
  }

  const madeIn = countryLookup(flattenStringOrArray(basic["made in"]));
  const printedIn = countryLookup(flattenStringOrArray(basic["printed in"]));

  return {
    madeIn: madeIn.length > 0 ? madeIn : [emptyCountrySelection()],
    printedIn,
  };
};

const formatsToFormValue = (
  releaseFormats: ReleaseFormatOfReleaseItem[] | undefined,
  allFormats: ReleasesFormatListItem[],
): AddReleaseFormFormatInputs => {
  if (releaseFormats == null || releaseFormats.length === 0) {
    return [defaultFormatInputRow()];
  }

  const formatIds = new Set(allFormats.map((format) => format.formatId));

  const rows = releaseFormats
    .map((format) => {
      const { formatId, amount, pictureSleeve, jukeboxHole } = format;

      if (!formatIds.has(formatId)) {
        return undefined;
      }

      return withNewId({
        formatId,
        amount: String(amount),
        pictureSleeve,
        jukeboxHole,
      });
    })
    .filter((row) => row !== undefined);

  return rows.length > 0 ? rows : [defaultFormatInputRow()];
};

const catNumbersToFormValue = (
  catalogueNumbers: ReleaseByIdResult["catalogueNumbers"] | undefined,
): AddReleaseFormCatNumbersInputs => {
  if (
    catalogueNumbers == null ||
    isCatNumbersJsonParsingError(catalogueNumbers)
  ) {
    return [defaultCatalogueNumberRow()];
  }

  const singles = Array.isArray(catalogueNumbers)
    ? catalogueNumbers
    : [catalogueNumbers];

  const rows = singles
    .map(catNumberSingleToRow)
    .filter((row) => row !== undefined);

  return rows.length > 0 ? rows : [defaultCatalogueNumberRow()];
};

const catNumberSingleToRow = (
  single: ReleaseCatNumbersSingle,
): CatalogueNumberRowState | undefined => {
  const labelNames = [
    ...("label" in single ? [single.label] : []),
    ...("labels" in single ? single.labels : []),
  ];
  const labelInputValues =
    labelNames.length > 0
      ? labelNames.map((name) => withNewId({ name }))
      : [emptyLabelInputValue()];

  if ("cat_number" in single) {
    return withNewId({
      shape: "flat" as const,
      labelInputValues,
      catalogueNumberInputValues: [withNewId({ value: single.cat_number })],
    });
  }

  if ("cat_numbers" in single) {
    return catNumbersPropertyToRow(labelInputValues, single.cat_numbers);
  }

  if (labelNames.length === 0) {
    return undefined;
  }

  return withNewId({
    shape: "flat" as const,
    labelInputValues,
    catalogueNumberInputValues: [emptyCatalogueNumberInputValue()],
  });
};

const catNumbersPropertyToRow = (
  labelInputValues: CatalogueNumberRowState["labelInputValues"],
  property: CatNumbersProperty,
): CatalogueNumberRowState | undefined => {
  if (typeof property === "string" || Array.isArray(property)) {
    const values = flattenStringOrArray(property).map((value) =>
      withNewId({ value }),
    );

    return withNewId({
      shape: "flat" as const,
      labelInputValues,
      catalogueNumberInputValues:
        values.length > 0 ? values : [emptyCatalogueNumberInputValue()],
    });
  }

  if ("in UK" in property) {
    return europeUkPropertyToRow(labelInputValues, property);
  }

  return undefined;
};

const europeUkPropertyToRow = (
  labelInputValues: CatalogueNumberRowState["labelInputValues"],
  property: Extract<CatNumbersProperty, { "in UK": string | string[] }>,
): CatalogueNumberRowState =>
  withNewId({
    shape: "europeUk" as const,
    labelInputValues,
    europeCatalogueNumberInputValues: flattenStringOrArray(
      property["in Europe"],
    ).map((value) => withNewId({ value })),
    ukCatalogueNumberInputValues: flattenStringOrArray(property["in UK"]).map(
      (value) => withNewId({ value }),
    ),
  });

const matrixRunoutToFormValue = (
  matrixRunout: ReleaseByIdResult["matrixRunout"] | undefined,
): AddReleaseFormMatrixRunoutDraft => {
  if (matrixRunout == null || isMatrixRunoutJsonParsingError(matrixRunout)) {
    return { value: "", treatAsText: false };
  }

  if (typeof matrixRunout === "string") {
    return { value: matrixRunout, treatAsText: true };
  }

  return {
    value: JSON.stringify(matrixRunout, null, 4),
    treatAsText: false,
  };
};

const isCountriesJsonParsingError = (
  countries: ReleaseByIdResult["countries"],
): countries is JsonParsingErrorData =>
  typeof countries === "object" &&
  countries !== null &&
  !Array.isArray(countries) &&
  "rawJson" in countries &&
  "error" in countries &&
  typeof countries.error === "string";

const isCatNumbersJsonParsingError = (
  catalogueNumbers: ReleaseByIdResult["catalogueNumbers"],
): catalogueNumbers is JsonParsingErrorData =>
  typeof catalogueNumbers === "object" &&
  catalogueNumbers !== null &&
  !Array.isArray(catalogueNumbers) &&
  "rawJson" in catalogueNumbers &&
  "error" in catalogueNumbers &&
  typeof catalogueNumbers.error === "string";

const isMatrixRunoutJsonParsingError = (
  matrixRunout: ReleaseByIdResult["matrixRunout"],
): matrixRunout is JsonParsingErrorData =>
  matrixRunout !== null &&
  typeof matrixRunout === "object" &&
  !Array.isArray(matrixRunout) &&
  "rawJson" in matrixRunout &&
  "error" in matrixRunout &&
  typeof matrixRunout.error === "string";
