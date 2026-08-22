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
  initialReleaseFormFieldErrors,
  type ReleaseFormCatNumbersFieldErrors,
  type ReleaseFormCountriesErrors,
  type ReleaseFormFormatErrors,
  type ReleaseFormRelatedReleasesErrors,
} from "../errorMessages";
import {
  validateDiscogsUrl,
  validateReleaseCountries,
  validateReleaseFormats,
  validateReleaseCatNumbers,
  validateReleaseMatrixRunout,
  validateRelatedReleases,
} from "../validation";

import type { GeneralizedDateFormInputValue } from "@/app/components/GeneralizedDateFormInput";
import type { DbSource } from "@/db/db-source";
import { ALL_DB_SOURCES } from "@/db/db-source-options";
import type { CountryListItem } from "@/types/countries";
import type { FormField } from "@/types/form";
import type { ReleasesFormatListItem } from "@/types/formats";
import type { ReleaseByIdResult } from "@/types/releases";
import type { TagId } from "@/types/tags";
import {
  validateOptionalTrimmedText,
  validatePassThrough,
  validateReleaseDate,
  validateRequiredTrimmedText,
} from "@/validation";

export type ReleaseFormState = {
  name: FormField<ReleaseFormNameInput>;
  releaseVersion: FormField;
  discogsUrl: FormField;
  releaseDate: FormField<GeneralizedDateFormInputValue>;
  countries: FormField<ReleaseFormCountries, ReleaseFormCountriesErrors>;
  formats: FormField<ReleaseFormFormatInputs, ReleaseFormFormatErrors>;
  catalogueNumbers: FormField<
    ReleaseFormCatNumbersDraft,
    ReleaseFormCatNumbersFieldErrors
  >;
  matrixRunout: FormField<ReleaseFormMatrixRunoutDraft>;
  selectedTags: FormField<Set<TagId>>;
  partOfQueenCollection: FormField<boolean>;
  relationToQueen: FormField<string>;
  comment: FormField<string>;
  conditionProblems: FormField<string>;
  relatedReleases: FormField<
    ReleaseFormRelatedReleaseRow[],
    ReleaseFormRelatedReleasesErrors,
    ValidReleaseFormRelatedReleaseRow[]
  >;
  dbSources: FormField<ReadonlySet<DbSource>>;
};

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
}: InitialReleaseFormStateValueArgs): ReleaseFormState => ({
  releaseVersion: {
    value: releaseBlueprint?.releaseVersion ?? "",
    valid: true,
    validationFn: validateRequiredTrimmedText("Release version is required."),
    errors: initialReleaseFormFieldErrors.releaseVersion,
    notifications: [],
  },
  name: {
    value: resolveNameInput(entry, releaseBlueprint),
    valid: true,
    validationFn: validatePassThrough,
    errors: initialReleaseFormFieldErrors.name,
    notifications: [],
  },
  discogsUrl: {
    value:
      mode === "update" && releaseBlueprint?.discogsUrl
        ? releaseBlueprint.discogsUrl
        : "",
    valid: true,
    validationFn: validateDiscogsUrl,
    errors: initialReleaseFormFieldErrors.discogsUrl,
    notifications: [],
  },
  releaseDate: {
    value: releaseDateToFormValue(
      releaseBlueprint?.releaseDate ?? entry.originalReleaseDate,
    ),
    valid: true,
    validationFn: validateReleaseDate(entry.originalReleaseDate),
    errors: initialReleaseFormFieldErrors.releaseDate,
    notifications: [],
  },
  countries: {
    value: countriesToFormValue(
      releaseBlueprint?.countries,
      allCountries,
      mode,
    ),
    valid: true,
    validationFn: validateReleaseCountries,
    errors: initialReleaseFormFieldErrors.countries,
    notifications: [],
  },
  formats: {
    value: formatsToFormValue(releaseBlueprint?.formats, allFormats, mode),
    valid: true,
    validationFn: validateReleaseFormats(allFormats),
    errors: initialReleaseFormFieldErrors.formats,
    notifications: [],
  },
  catalogueNumbers: {
    value: catNumbersToFormValue(releaseBlueprint?.catalogueNumbers, mode),
    valid: true,
    validationFn: validateReleaseCatNumbers,
    errors: initialReleaseFormFieldErrors.catalogueNumbers,
    notifications: [],
  },
  matrixRunout: {
    value: matrixRunoutToFormValue(releaseBlueprint?.matrixRunout),
    valid: true,
    validationFn: validateReleaseMatrixRunout,
    errors: initialReleaseFormFieldErrors.matrixRunout,
    notifications: [],
  },
  selectedTags: {
    value: new Set<string>(
      releaseBlueprint?.tags.map((tag) => tag.tagId) ?? [],
    ),
    valid: true,
    validationFn: validatePassThrough,
    errors: initialReleaseFormFieldErrors.selectedTags,
    notifications: [],
  },
  partOfQueenCollection: {
    value:
      releaseBlueprint?.partOfQueenCollection ?? entry.partOfQueenCollection,
    valid: true,
    validationFn: validatePassThrough,
    errors: initialReleaseFormFieldErrors.partOfQueenCollection,
    notifications: [],
  },
  relationToQueen: {
    value: releaseBlueprint?.relationToQueen ?? "",
    valid: true,
    validationFn: validateOptionalTrimmedText,
    errors: initialReleaseFormFieldErrors.relationToQueen,
    notifications: [],
  },
  comment: {
    value: releaseBlueprint?.comment ?? "",
    valid: true,
    validationFn: validateOptionalTrimmedText,
    errors: initialReleaseFormFieldErrors.comment,
    notifications: [],
  },
  conditionProblems: {
    value: releaseBlueprint?.conditionProblems ?? "",
    valid: true,
    validationFn: validateOptionalTrimmedText,
    errors: initialReleaseFormFieldErrors.conditionProblems,
    notifications: [],
  },
  relatedReleases: {
    value: relatedReleasesToFormValue(
      releaseBlueprint?.parentReleases,
      releaseBlueprint?.childReleases,
    ),
    valid: true,
    validationFn: validateRelatedReleases,
    errors: initialReleaseFormFieldErrors.relatedReleases,
    notifications: [],
  },
  dbSources: {
    value: dbSources ?? new Set(ALL_DB_SOURCES),
    valid: true,
    validationFn: validatePassThrough,
    errors: initialReleaseFormFieldErrors.dbSources,
    notifications: [],
  },
});
