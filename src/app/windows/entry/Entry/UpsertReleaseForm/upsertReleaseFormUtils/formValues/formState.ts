import {
  type UpsertReleaseFormCatNumbersDraft,
  catNumbersToFormValue,
} from "./catNumbers";
import { type UpsertReleaseFormCountries, countriesToFormValue } from "./countries";
import type { UpsertReleaseFormEntry } from "./entry";
import { formatsToFormValue, type UpsertReleaseFormFormatInputs } from "./formats";
import {
  matrixRunoutToFormValue,
  type UpsertReleaseFormMatrixRunoutDraft,
} from "./matrixRunout";
import { resolveNameInput, type UpsertReleaseFormNameInput } from "./name";
import {
  type UpsertReleaseFormRelatedReleaseRow,
  type ValidUpsertReleaseFormRelatedReleaseRow,
  relatedReleasesToFormValue,
} from "./relatedReleases";
import { releaseDateToFormValue } from "./releaseDate";

import type { UpsertReleaseFormTabMode } from "../../../types";
import {
  validateDiscogsUrl,
  validateReleaseCatNumbers,
  validateReleaseCountries,
  validateReleaseFormats,
  validateReleaseMatrixRunout,
  validateRelatedReleases,
} from "../validation";

import type { GeneralizedDateFormInputValue } from "@/app/components/GeneralizedDateFormInput";
import type { DbSource } from "@/db/db-source";
import { ALL_DB_SOURCES } from "@/db/db-source-options";
import type { CountryListItem } from "@/types/countries";
import type { FormStateType, InitialFormStateValue } from "@/types/form";
import type { ReleasesFormatListItem } from "@/types/formats";
import type { ReleaseByIdResult } from "@/types/releases";
import type { TagId } from "@/types/tags";
import {
  validateOptionalTrimmedText,
  validatePassThrough,
  validateReleaseDate,
  validateRequiredTrimmedText,
} from "@/validation";

export type UpsertReleaseFormDraft = {
  name: UpsertReleaseFormNameInput;
  releaseVersion: string;
  discogsUrl: string;
  releaseDate: GeneralizedDateFormInputValue;
  countries: UpsertReleaseFormCountries;
  formats: UpsertReleaseFormFormatInputs;
  catalogueNumbers: UpsertReleaseFormCatNumbersDraft;
  matrixRunout: UpsertReleaseFormMatrixRunoutDraft;
  selectedTags: Set<TagId>;
  partOfQueenCollection: boolean;
  relationToQueen: string;
  comment: string;
  conditionProblems: string;
  relatedReleases: UpsertReleaseFormRelatedReleaseRow[];
  dbSources: ReadonlySet<DbSource>;
};

export type ValidatedUpsertReleaseFormDraft = Omit<
  UpsertReleaseFormDraft,
  "relatedReleases"
> & {
  relatedReleases: ValidUpsertReleaseFormRelatedReleaseRow[];
};

export type UpsertReleaseFormInitialState = InitialFormStateValue<
  UpsertReleaseFormDraft,
  ValidatedUpsertReleaseFormDraft
>;

export type UpsertReleaseFormState = FormStateType<
  UpsertReleaseFormDraft,
  ValidatedUpsertReleaseFormDraft
>;

type InitialUpsertReleaseFormStateValueArgs = {
  entry: UpsertReleaseFormEntry;
  allFormats: ReleasesFormatListItem[];
  allCountries: CountryListItem[];
  releaseBlueprint?: ReleaseByIdResult | undefined;
  dbSources?: ReadonlySet<DbSource> | undefined;
  mode: UpsertReleaseFormTabMode;
};

export const initialUpsertReleaseFormStateValue = ({
  entry,
  allFormats,
  allCountries,
  releaseBlueprint,
  dbSources,
  mode,
}: InitialUpsertReleaseFormStateValueArgs): UpsertReleaseFormInitialState => ({
  releaseVersion: {
    value: releaseBlueprint?.releaseVersion ?? "",
    validationFn: (state) =>
      validateRequiredTrimmedText(
        state.releaseVersion.value,
        "Release version is required.",
      ),
  },
  name: {
    value: resolveNameInput(entry, releaseBlueprint),
    validationFn: (state) => validatePassThrough(state.name.value),
  },
  discogsUrl: {
    value:
      mode === "update" && releaseBlueprint?.discogsUrl
        ? releaseBlueprint.discogsUrl
        : "",
    validationFn: validateDiscogsUrl,
  },
  releaseDate: {
    value: releaseDateToFormValue(
      releaseBlueprint
        ? releaseBlueprint.releaseDate
        : entry.originalReleaseDate,
    ),
    validationFn: (state) =>
      validateReleaseDate(state.releaseDate.value, entry.originalReleaseDate),
  },
  countries: {
    value: countriesToFormValue(
      releaseBlueprint?.countries,
      allCountries,
      mode,
    ),
    validationFn: validateReleaseCountries,
  },
  formats: {
    value: formatsToFormValue(releaseBlueprint?.formats, allFormats, mode),
    validationFn: validateReleaseFormats(allFormats),
  },
  catalogueNumbers: {
    value: catNumbersToFormValue(releaseBlueprint?.catalogueNumbers, mode),
    validationFn: validateReleaseCatNumbers,
  },
  matrixRunout: {
    value: matrixRunoutToFormValue(releaseBlueprint?.matrixRunout),
    validationFn: validateReleaseMatrixRunout,
  },
  selectedTags: {
    value: new Set<string>(
      releaseBlueprint?.tags.map((tag) => tag.tagId) ?? [],
    ),
    validationFn: (state) => validatePassThrough(state.selectedTags.value),
  },
  partOfQueenCollection: {
    value:
      (entry.partOfQueenCollection ||
        releaseBlueprint?.partOfQueenCollection) ??
      false,
    validationFn: (state) =>
      validatePassThrough(state.partOfQueenCollection.value),
  },
  relationToQueen: {
    value: releaseBlueprint?.relationToQueen ?? "",
    validationFn: (state) =>
      validateOptionalTrimmedText(state.relationToQueen.value),
  },
  comment: {
    value: releaseBlueprint?.comment ?? "",
    validationFn: (state) => validateOptionalTrimmedText(state.comment.value),
  },
  conditionProblems: {
    value: releaseBlueprint?.conditionProblems ?? "",
    validationFn: (state) =>
      validateOptionalTrimmedText(state.conditionProblems.value),
  },
  relatedReleases: {
    value:
      mode === "create"
        ? []
        : relatedReleasesToFormValue(
            releaseBlueprint?.parentReleases,
            releaseBlueprint?.childReleases,
          ),
    validationFn: validateRelatedReleases,
  },
  dbSources: {
    value: dbSources ?? new Set(ALL_DB_SOURCES),
    validationFn: (state) => validatePassThrough(state.dbSources.value),
  },
});
