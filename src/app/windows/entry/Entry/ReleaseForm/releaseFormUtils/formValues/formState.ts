import {
  type ReleaseFormCatNumbersDraft,
  catNumbersToFormValue,
} from "./catNumbers";
import { type ReleaseFormCountries, countriesToFormValue } from "./countries";
import type { ReleaseFormEntry } from "./entry";
import { formatsToFormValue, type ReleaseFormFormatInputs } from "./formats";
import {
  matrixRunoutToFormValue,
  type ReleaseFormMatrixRunoutDraft,
} from "./matrixRunout";
import { resolveNameInput, type ReleaseFormNameInput } from "./name";
import {
  type ReleaseFormRelatedReleaseRow,
  type ValidReleaseFormRelatedReleaseRow,
  relatedReleasesToFormValue,
} from "./relatedReleases";
import { releaseDateToFormValue } from "./releaseDate";

import type { ReleaseFormTabMode } from "../../../types";
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
import type {
  FormStateType,
  InitialFormStateValue,
} from "@/hooks/useFormState";
import type { CountryListItem } from "@/types/countries";
import type { ReleasesFormatListItem } from "@/types/formats";
import type { ReleaseByIdResult } from "@/types/releases";
import type { TagId } from "@/types/tags";
import {
  validateOptionalTrimmedText2,
  validatePassThrough2,
  validateReleaseDate2,
  validateRequiredTrimmedText2,
} from "@/validation";

export type ReleaseFormDraft = {
  name: ReleaseFormNameInput;
  releaseVersion: string;
  discogsUrl: string;
  releaseDate: GeneralizedDateFormInputValue;
  countries: ReleaseFormCountries;
  formats: ReleaseFormFormatInputs;
  catalogueNumbers: ReleaseFormCatNumbersDraft;
  matrixRunout: ReleaseFormMatrixRunoutDraft;
  selectedTags: Set<TagId>;
  partOfQueenCollection: boolean;
  relationToQueen: string;
  comment: string;
  conditionProblems: string;
  relatedReleases: ReleaseFormRelatedReleaseRow[];
  dbSources: ReadonlySet<DbSource>;
};

export type ValidatedReleaseFormDraft = Omit<
  ReleaseFormDraft,
  "relatedReleases"
> & {
  relatedReleases: ValidReleaseFormRelatedReleaseRow[];
};

export type ReleaseFormInitialState = InitialFormStateValue<
  ReleaseFormDraft,
  ValidatedReleaseFormDraft
>;

export type ReleaseFormState = FormStateType<
  ReleaseFormDraft,
  ValidatedReleaseFormDraft
>;

type InitialReleaseFormStateValueArgs = {
  entry: ReleaseFormEntry;
  allFormats: ReleasesFormatListItem[];
  allCountries: CountryListItem[];
  releaseBlueprint?: ReleaseByIdResult | undefined;
  dbSources?: ReadonlySet<DbSource> | undefined;
  mode: ReleaseFormTabMode;
};

export const initialReleaseFormStateValue = ({
  entry,
  allFormats,
  allCountries,
  releaseBlueprint,
  dbSources,
  mode,
}: InitialReleaseFormStateValueArgs): ReleaseFormInitialState => ({
  releaseVersion: {
    value: releaseBlueprint?.releaseVersion ?? "",
    validationFn: (state) =>
      validateRequiredTrimmedText2(
        state.releaseVersion.value,
        "Release version is required.",
      ),
  },
  name: {
    value: resolveNameInput(entry, releaseBlueprint),
    validationFn: (state) => validatePassThrough2(state.name.value),
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
      releaseBlueprint?.releaseDate ?? entry.originalReleaseDate,
    ),
    validationFn: (state) =>
      validateReleaseDate2(state.releaseDate.value, entry.originalReleaseDate),
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
    validationFn: (state) => validatePassThrough2(state.selectedTags.value),
  },
  partOfQueenCollection: {
    value:
      (entry.partOfQueenCollection ||
        releaseBlueprint?.partOfQueenCollection) ??
      false,
    validationFn: (state) =>
      validatePassThrough2(state.partOfQueenCollection.value),
  },
  relationToQueen: {
    value: releaseBlueprint?.relationToQueen ?? "",
    validationFn: (state) =>
      validateOptionalTrimmedText2(state.relationToQueen.value),
  },
  comment: {
    value: releaseBlueprint?.comment ?? "",
    validationFn: (state) => validateOptionalTrimmedText2(state.comment.value),
  },
  conditionProblems: {
    value: releaseBlueprint?.conditionProblems ?? "",
    validationFn: (state) =>
      validateOptionalTrimmedText2(state.conditionProblems.value),
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
    validationFn: (state) => validatePassThrough2(state.dbSources.value),
  },
});
