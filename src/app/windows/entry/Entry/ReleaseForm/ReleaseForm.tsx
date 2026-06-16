import {
  useState,
  type Dispatch,
  type FC,
  type FormEvent,
  type SetStateAction,
} from "react";

import ReleaseCatalogueNumbersSection from "./ReleaseCatalogueNumbersSection";
import ReleaseCountriesSection from "./ReleaseCountriesSection";
import styles from "./ReleaseForm.module.css";
import ReleaseFormFormatsSection from "./ReleaseFormFormatsSection";
import ReleaseFormPreview from "./ReleaseFormPreview";
import {
  catalogueNumbersInputBucketKeyFor,
  removeMadeInCountrySelectionRowFromFieldErrors,
  stripPrintedInFromCountriesFieldErrors,
  isCatalogueNumbersInputFieldKey,
  isCountriesInputFieldKey,
  isFormatInputFieldKey,
  type ReleaseFormInputFieldKey,
  emptyMutableCountriesSubsectionErrors,
  initialReleaseFormFieldErrors,
} from "./releaseFormUtils/errorMessages";
import {
  defaultCatalogueNumberRow,
  defaultFormatInputRow,
  emptyCountrySelection,
  type ReleaseFormState,
  type ReleaseFormEntry,
} from "./releaseFormUtils/formValues";
import { toCreateMusicalReleaseInput } from "./releaseFormUtils/toCreateMusicalReleaseInput";
import ReleaseMatrixRunoutField from "./ReleaseMatrixRunoutField";
import ReleaseNameField from "./ReleaseNameField";

import ConfirmDialog from "@/app/components/ConfirmDialog";
import DbSourcesCheckboxes from "@/app/components/DbSourcesCheckboxes";
import AddTagsFormSection from "@/app/components/Form/AddTagsFormSection";
import FormFieldErrorMessages from "@/app/components/FormFieldErrorMessages";
import FormFieldNotifications from "@/app/components/FormFieldNotifications";
import GeneralizedDateFormInput from "@/app/components/GeneralizedDateFormInput";
import api from "@/app/windows/entry/api";
import type { DbSource } from "@/db/db-source";
import { dbSourceLabel } from "@/db/db-source-options";
import type { CountryListItem } from "@/types/countries";
import type { ReleasesFormatListItem } from "@/types/formats";
import type { LabelListItem } from "@/types/labels";
import type { CreateMusicalReleaseInput } from "@/types/releases";
import type { TagListItem } from "@/types/tags";
import { isDateInputFieldKey, omitProperty } from "@/utils/common";
import { updateImmutableSet } from "@/utils/immutableSet";

export type ReleaseFormProps = {
  entry: ReleaseFormEntry;
  dbSource: DbSource;
  allFormats: ReleasesFormatListItem[];
  labels: LabelListItem[];
  tagsAvailableForReleases: TagListItem[];
  allCountries: CountryListItem[];
  formState: ReleaseFormState;
  setFormState: Dispatch<SetStateAction<ReleaseFormState>>;
  onClearFormState: () => void;
  onReleaseCreated: (
    releaseId: string | undefined,
    notifications: string[],
    errors: string[],
  ) => void;
};

const RELEASE_DATE_FIELD_ERROR_ID = "add-release-date-error";
const RELEASE_VERSION_FIELD_ERROR_ID = "add-release-version-error";
const RELEASE_VERSION_FIELD_NOTIFICATIONS_ID =
  "add-release-version-notifications";
const DISCOGS_URL_FIELD_ERROR_ID = "add-release-discogs-url-error";
const DISCOGS_URL_FIELD_NOTIFICATIONS_ID =
  "add-release-discogs-url-notifications";
const COMMENT_FIELD_NOTIFICATIONS_ID = "add-release-comment-notifications";
const CONDITION_PROBLEMS_FIELD_NOTIFICATIONS_ID =
  "add-release-condition-problems-notifications";
const RELATION_TO_QUEEN_FIELD_NOTIFICATIONS_ID =
  "add-release-relation-to-queen-notifications";

const ReleaseForm: FC<ReleaseFormProps> = ({
  entry,
  dbSource,
  onClearFormState,
  onReleaseCreated,
  allFormats,
  labels,
  tagsAvailableForReleases,
  allCountries,
  formState,
  setFormState,
}) => {
  const [showSubmissionValidationError, setShowSubmissionValidationError] =
    useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [submitError, setSubmitError] = useState<string>();

  const setFieldValue = <K extends keyof ReleaseFormState>(
    key: K,
    value:
      | ReleaseFormState[K]["value"]
      | ((prev: ReleaseFormState) => ReleaseFormState[K]["value"]),
  ) =>
    setFormState((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: typeof value === "function" ? value(prev) : value,
      },
    }));

  const setField = <K extends keyof ReleaseFormState>(
    key: K,
    value:
      | ReleaseFormState[K]
      | ((prev: ReleaseFormState) => ReleaseFormState[K]),
  ) => {
    setFormState((prev) => ({
      ...prev,
      [key]: typeof value === "function" ? value(prev) : value,
    }));
  };

  // on focus we attempt to remove errors related to the field that is being focused
  const onFocus = (key: ReleaseFormInputFieldKey) => {
    setShowSubmissionValidationError(false);

    if (typeof key === "string" && !isDateInputFieldKey(key)) {
      setField(key, (prev) => ({
        ...prev[key],
        notifications: [],
      }));
    }

    if (isFormatInputFieldKey(key)) {
      const { formatRowId, field } = key;

      setField("formats", (prev) => {
        const formatsErrors = prev.formats.errors;

        const nextFormatRowErrors = formatsErrors[formatRowId]?.filter(
          (error) =>
            error.sources &&
            error.sources.length > 0 &&
            !error.sources.includes(field),
        );

        return {
          ...prev.formats,
          errors: nextFormatRowErrors
            ? {
                ...formatsErrors,
                [formatRowId]: nextFormatRowErrors,
              }
            : omitProperty(formatsErrors, formatRowId),
        };
      });

      return;
    }

    if (isCatalogueNumbersInputFieldKey(key)) {
      const { catNumberRowId, field, inputValueId } = key;

      setField("catalogueNumbers", (prev) => {
        const catalogueNumbersErrors = prev.catalogueNumbers.errors;
        const rowErrors = catalogueNumbersErrors[catNumberRowId];

        if (!rowErrors) {
          return prev.catalogueNumbers;
        }

        const errorKey = catalogueNumbersInputBucketKeyFor(field);

        const nextRowErrors = {
          ...rowErrors,
          [errorKey]: omitProperty(rowErrors[errorKey], inputValueId),
        };

        return {
          ...prev.catalogueNumbers,
          errors: {
            ...catalogueNumbersErrors,
            [catNumberRowId]: nextRowErrors,
          },
        };
      });

      return;
    }

    if (isCountriesInputFieldKey(key)) {
      const { countriesSubsection, rowId } = key;

      setField("countries", (prev) => {
        const countriesErrors = prev.countries.errors;
        const subsection = countriesErrors[countriesSubsection];

        // The focused row's per-row error is dropped, and subsection-level
        // errors (uniqueness, plus the cross-section "made-in required when
        // printed-in is set" rule that lives on madeIn) are cleared too —
        // editing this row can resolve all of them and they'll be re-checked
        // on blur.
        const nextSubsection = {
          countrySelectErrorMessages: omitProperty(
            subsection.countrySelectErrorMessages,
            rowId,
          ),
          propertyErrorMessages: new Set<string>(),
        };

        return {
          ...prev.countries,
          errors: {
            ...countriesErrors,
            [countriesSubsection]: nextSubsection,
          },
        };
      });

      return;
    }

    const errorKey = isDateInputFieldKey(key) ? "releaseDate" : key;

    setField(errorKey, (prev) => {
      const errors = prev[errorKey].errors.filter(
        (error) =>
          error.sources &&
          error.sources.length > 0 &&
          !error.sources.includes(key),
      );

      return {
        ...prev[errorKey],
        errors,
        notifications: [],
      };
    });
  };

  const validateField = <K extends keyof ReleaseFormState>(key: K) => {
    const formFieldData = formState[key];

    // Correlated union: TS can't see that `value` and `validationFn`'s parameter
    // share the same K, so we narrow the call signature locally. Sound because
    // both fields come from the same `formState[key]` instance.
    type ValueType = ReleaseFormState[K]["value"];
    type ResultType = ReturnType<ReleaseFormState[K]["validationFn"]>;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const validationFn = formFieldData.validationFn as (
      v: ValueType,
    ) => ResultType;
    const validationResult = validationFn(formFieldData.value);
    const { valid, value, notifications = [] } = validationResult;

    setField(key, (prev) => ({
      ...prev[key],
      valid,
      value,
      notifications,
      errors: validationResult.valid
        ? initialReleaseFormFieldErrors[key]
        : validationResult.errorMessages,
    }));

    return validationResult;
  };

  const onBlur = (key: keyof ReleaseFormState) => validateField(key);

  const addFormatRow = () => {
    setFieldValue("formats", (prev) => [
      ...prev.formats.value,
      defaultFormatInputRow(),
    ]);
  };

  const removeFormatRow = (rowId: string) => {
    setFieldValue("formats", (prev) =>
      prev.formats.value.filter((formatRow) => formatRow.id !== rowId),
    );
  };

  const addCatalogueNumbersRow = () => {
    setFieldValue("catalogueNumbers", (prev) => [
      ...prev.catalogueNumbers.value,
      defaultCatalogueNumberRow(),
    ]);
  };

  const removeCatalogueNumbersRow = (rowId: string) => {
    setField("catalogueNumbers", (prev) => ({
      ...prev.catalogueNumbers,
      value: prev.catalogueNumbers.value.filter((row) => row.id !== rowId),
      errors: omitProperty(prev.catalogueNumbers.errors, rowId),
    }));
  };

  const addSelectedTag = (tagId: string) => {
    setFieldValue("selectedTags", (prev) =>
      new Set(prev.selectedTags.value).add(tagId),
    );
  };

  const removeSelectedTag = (tagId: string) => {
    setFieldValue("selectedTags", (prev) => {
      const next = new Set(prev.selectedTags.value);
      next.delete(tagId);

      return next;
    });
  };

  const addCountrySelectionRow = () => {
    setFieldValue("countries", (prev) => ({
      ...prev.countries.value,
      madeIn: [...prev.countries.value.madeIn, emptyCountrySelection()],
    }));
  };

  const removeCountrySelectionRow = (inputId: string) => {
    setField("countries", (prev) => ({
      ...prev.countries,
      value: {
        ...prev.countries.value,
        madeIn: prev.countries.value.madeIn.filter((row) => row.id !== inputId),
      },
      errors: removeMadeInCountrySelectionRowFromFieldErrors(
        prev.countries.errors,
        inputId,
      ),
    }));
  };

  const clearAllCountries = () => {
    setField("countries", (prev) => ({
      ...prev.countries,
      value: {
        madeIn: [],
        printedIn: [],
      },
      errors: {
        madeIn: emptyMutableCountriesSubsectionErrors(),
        printedIn: emptyMutableCountriesSubsectionErrors(),
      },
    }));
  };

  const setCountrySelectionCodeName = (inputId: string, codeName: string) => {
    setFieldValue("countries", (prev) => ({
      ...prev.countries.value,
      madeIn: prev.countries.value.madeIn.map((row) =>
        row.id === inputId ? { ...row, codeName } : row,
      ),
    }));
  };

  const openPrintedInCountriesSection = () => {
    setFieldValue("countries", (prev) => ({
      ...prev.countries.value,
      printedIn: [emptyCountrySelection()],
    }));
  };

  const closePrintedInCountriesSection = () => {
    setField("countries", (prev) => ({
      ...prev.countries,
      value: {
        ...prev.countries.value,
        printedIn: [],
      },
      errors: stripPrintedInFromCountriesFieldErrors(prev.countries.errors),
    }));
  };

  const addPrintedInCountrySelectionRow = () => {
    setFieldValue("countries", (prev) => ({
      ...prev.countries.value,
      printedIn: [...prev.countries.value.printedIn, emptyCountrySelection()],
    }));
  };

  const removePrintedInCountrySelectionRow = (inputId: string) => {
    setFieldValue("countries", (prev) => ({
      ...prev.countries.value,
      printedIn: prev.countries.value.printedIn.filter(
        (row) => row.id !== inputId,
      ),
    }));
  };

  const setPrintedInCountrySelectionCodeName = (
    inputId: string,
    codeName: string,
  ) => {
    setFieldValue("countries", (prev) => ({
      ...prev.countries.value,
      printedIn: prev.countries.value.printedIn.map((row) =>
        row.id === inputId ? { ...row, codeName } : row,
      ),
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validationResults = {
      releaseVersion: validateField("releaseVersion"),
      discogsUrl: validateField("discogsUrl"),
      comment: validateField("comment"),
      conditionProblems: validateField("conditionProblems"),
      releaseDate: validateField("releaseDate"),
      countries: validateField("countries"),
      formats: validateField("formats"),
      catalogueNumbers: validateField("catalogueNumbers"),
      matrixRunout: validateField("matrixRunout"),
      selectedTags: validateField("selectedTags"),
      partOfQueenCollection: validateField("partOfQueenCollection"),
      relationToQueen: validateField("relationToQueen"),
      name: validateField("name"),
    };

    const formIsValid = Object.values(validationResults).every(
      (result) => result.valid,
    );

    console.info({
      formState,
      validationResults,
      formIsValid,
    });

    setShowSubmissionValidationError(!formIsValid);

    if (formIsValid) {
      setSubmitError(undefined);
      setIsConfirmOpen(true);
    }
  };

  const handleToggleDbSource = (source: DbSource) => {
    setFieldValue("dbSources", (prev) =>
      updateImmutableSet(
        source,
        prev.dbSources.value.has(source) ? "remove" : "add",
      )(prev.dbSources.value),
    );
  };

  const handleConfirmCreate = () => {
    if (isSubmitting) {
      return;
    }

    const {
      name: { value: name },
      releaseVersion: { value: releaseVersion },
      releaseDate: { value: releaseDate },
      discogsUrl: { value: discogsUrl },
      countries: { value: countries },
      formats: { value: formats },
      catalogueNumbers: { value: catalogueNumbers },
      matrixRunout: { value: matrixRunout },
      selectedTags: { value: selectedTags },
      partOfQueenCollection: { value: partOfQueenCollection },
      relationToQueen: { value: relationToQueen },
      comment: { value: comment },
      conditionProblems: { value: conditionProblems },
      dbSources: { value: dbSources },
    } = formState;

    const createInput = toCreateMusicalReleaseInput({
      entry,
      name,
      releaseVersion,
      releaseDate,
      discogsUrl,
      countries,
      formats,
      catalogueNumbers,
      matrixRunout,
      selectedTags,
      partOfQueenCollection,
      relationToQueen,
      comment,
      conditionProblems,
    });

    setIsSubmitting(true);
    setSubmitError(undefined);

    createReleasesAcrossDbSources(createInput, dbSources, dbSource)
      .then(({ releaseId, outcomes }) => {
        const { notifications, errors } = buildCreateReleaseFeedback(outcomes);

        console.info("Created musical release", {
          releaseId,
          notifications,
          errors,
          outcomes,
        });

        setIsConfirmOpen(false);
        onReleaseCreated(releaseId, notifications, errors);
      })
      .catch((error: unknown) => {
        console.error("Failed to create musical release", error);
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Failed to create musical release",
        );
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleCancelConfirm = () => {
    if (isSubmitting) {
      return;
    }

    setIsConfirmOpen(false);
    setSubmitError(undefined);
  };

  const releaseVersionErrors = formState.releaseVersion.errors;
  const releaseVersionNotifications = formState.releaseVersion.notifications;
  const discogsUrlErrors = formState.discogsUrl.errors;
  const discogsUrlNotifications = formState.discogsUrl.notifications;
  const commentNotifications = formState.comment.notifications;
  const conditionProblemsNotifications =
    formState.conditionProblems.notifications;
  const relationToQueenNotifications = formState.relationToQueen.notifications;
  const matrixRunoutErrors = formState.matrixRunout.errors;
  const matrixRunoutNotifications = formState.matrixRunout.notifications;
  const releaseDateErrors = formState.releaseDate.errors;
  const hasReleaseVersionErrors = releaseVersionErrors.length > 0;
  const hasReleaseVersionNotifications = releaseVersionNotifications.length > 0;
  const hasDiscogsUrlErrors = discogsUrlErrors.length > 0;
  const hasDiscogsUrlNotifications = discogsUrlNotifications.length > 0;
  const hasCommentNotifications = commentNotifications.length > 0;
  const hasConditionProblemsNotifications =
    conditionProblemsNotifications.length > 0;
  const hasRelationToQueenNotifications =
    relationToQueenNotifications.length > 0;
  const hasReleaseDateErrors = releaseDateErrors.length > 0;

  const releaseVersionDescribedByIds = [
    hasReleaseVersionErrors ? RELEASE_VERSION_FIELD_ERROR_ID : null,
    hasReleaseVersionNotifications
      ? RELEASE_VERSION_FIELD_NOTIFICATIONS_ID
      : null,
  ]
    .filter((id): id is string => id !== null)
    .join(" ");

  const discogsUrlDescribedByIds = [
    hasDiscogsUrlErrors ? DISCOGS_URL_FIELD_ERROR_ID : null,
    hasDiscogsUrlNotifications ? DISCOGS_URL_FIELD_NOTIFICATIONS_ID : null,
  ]
    .filter((id): id is string => id !== null)
    .join(" ");

  return (
    <div className={styles.section}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.heading} htmlFor="add-release-version">
            Release version
            <sup className={styles.requiredMark} aria-hidden="true">
              *
            </sup>
          </label>
          <input
            id="add-release-version"
            className={styles.input}
            type="text"
            aria-required
            value={formState.releaseVersion.value}
            onChange={(e) => setFieldValue("releaseVersion", e.target.value)}
            onFocus={() => onFocus("releaseVersion")}
            onBlur={() => onBlur("releaseVersion")}
            aria-invalid={hasReleaseVersionErrors}
            aria-describedby={releaseVersionDescribedByIds || undefined}
            autoComplete="off"
            required
          />
          <FormFieldErrorMessages
            id={RELEASE_VERSION_FIELD_ERROR_ID}
            messages={releaseVersionErrors}
          />
          <FormFieldNotifications
            id={RELEASE_VERSION_FIELD_NOTIFICATIONS_ID}
            messages={releaseVersionNotifications}
          />
        </div>

        <ReleaseNameField
          entryMainName={entry.mainName}
          entryAltNames={entry.altNames}
          value={formState.name.value}
          onChange={(value) => setFieldValue("name", value)}
        />

        <hr
          className={`${styles.sectionDivider} ${styles.sectionDividerMoreSpaceBefore}`}
          aria-hidden
        />

        <div className={styles.field}>
          <h2 className={styles.heading}>Release date</h2>
          <GeneralizedDateFormInput
            date={formState.releaseDate.value}
            startDate={entry.originalReleaseDate}
            setDate={(releaseDate) => setFieldValue("releaseDate", releaseDate)}
            onFocus={onFocus}
            onBlur={() => onBlur("releaseDate")}
            invalid={hasReleaseDateErrors}
            groupErrorId={RELEASE_DATE_FIELD_ERROR_ID}
          />
          <FormFieldErrorMessages
            id={RELEASE_DATE_FIELD_ERROR_ID}
            messages={releaseDateErrors}
          />
        </div>

        <hr
          className={`${styles.sectionDivider} ${styles.sectionDividerMoreSpaceBefore}`}
          aria-hidden
        />

        <div className={styles.field}>
          <label className={styles.heading} htmlFor="add-release-discogs-url">
            Discogs URL
          </label>
          <input
            id="add-release-discogs-url"
            className={styles.input}
            type="url"
            value={formState.discogsUrl.value}
            onChange={(e) => setFieldValue("discogsUrl", e.target.value)}
            onFocus={() => onFocus("discogsUrl")}
            onBlur={() => onBlur("discogsUrl")}
            aria-invalid={hasDiscogsUrlErrors}
            aria-describedby={discogsUrlDescribedByIds || undefined}
            autoComplete="off"
          />
          <FormFieldErrorMessages
            id={DISCOGS_URL_FIELD_ERROR_ID}
            messages={discogsUrlErrors}
          />
          <FormFieldNotifications
            id={DISCOGS_URL_FIELD_NOTIFICATIONS_ID}
            messages={discogsUrlNotifications}
          />
        </div>

        <hr
          className={`${styles.sectionDivider} ${styles.sectionDividerMoreSpaceBefore}`}
          aria-hidden
        />

        <ReleaseCountriesSection
          countries={allCountries}
          countrySelections={formState.countries.value.madeIn}
          onSetCountryCodeName={setCountrySelectionCodeName}
          onAddRow={addCountrySelectionRow}
          onRemoveRow={removeCountrySelectionRow}
          onFocus={(rowId) => onFocus({ countriesSubsection: "madeIn", rowId })}
          onBlur={() => onBlur("countries")}
          heading="Countries"
          selectIdPrefix="add-release-country"
          rowLabelPrefix="Country"
          removeRowAriaLabel="Remove country row"
          onRemove={clearAllCountries}
          removeAriaLabel="Remove all countries and printed-in countries"
          errors={formState.countries.errors.madeIn}
        />

        {formState.countries.value.printedIn.length > 0 ? (
          <ReleaseCountriesSection
            countries={allCountries}
            countrySelections={formState.countries.value.printedIn}
            onSetCountryCodeName={setPrintedInCountrySelectionCodeName}
            onAddRow={addPrintedInCountrySelectionRow}
            onRemoveRow={removePrintedInCountrySelectionRow}
            onFocus={(rowId) =>
              onFocus({ countriesSubsection: "printedIn", rowId })
            }
            onBlur={() => onBlur("countries")}
            heading="Printed in countries"
            selectIdPrefix="add-release-printed-in-country"
            rowLabelPrefix="Printed-in country"
            removeRowAriaLabel="Remove printed-in country row"
            onRemove={closePrintedInCountriesSection}
            removeAriaLabel='Remove "printed in" countries section'
            errors={formState.countries.errors.printedIn}
          />
        ) : (
          <button
            type="button"
            className={styles.printedInCountriesCta}
            onClick={openPrintedInCountriesSection}
          >
            Add &quot;printed in&quot; countries
          </button>
        )}

        <hr className={styles.sectionDivider} aria-hidden />

        <ReleaseFormFormatsSection
          formatInputs={formState.formats.value}
          releasesFormats={allFormats}
          errors={formState.formats.errors}
          setFormats={(formatsUpdateFn) =>
            setFieldValue("formats", (prev) =>
              formatsUpdateFn(prev.formats.value),
            )
          }
          addFormatRow={addFormatRow}
          removeFormatRow={removeFormatRow}
          onFieldFocus={onFocus}
          onBlur={() => onBlur("formats")}
        />

        <hr className={styles.sectionDivider} aria-hidden />

        <ReleaseCatalogueNumbersSection
          labels={labels}
          catalogueNumbers={formState.catalogueNumbers.value}
          setCatalogueNumbers={(update) =>
            setFieldValue("catalogueNumbers", (prev) =>
              update(prev.catalogueNumbers.value),
            )
          }
          errors={formState.catalogueNumbers.errors}
          addCatalogueNumbersRow={addCatalogueNumbersRow}
          removeCatalogueNumbersRow={removeCatalogueNumbersRow}
          onFieldFocus={onFocus}
          onBlurRowColumn={() => onBlur("catalogueNumbers")}
        />

        <hr className={styles.sectionDivider} aria-hidden />

        <ReleaseMatrixRunoutField
          matrixRunout={formState.matrixRunout.value}
          errorMessages={matrixRunoutErrors}
          notifications={matrixRunoutNotifications}
          onValueChange={(value) =>
            setFieldValue("matrixRunout", (prev) => ({
              ...prev.matrixRunout.value,
              value,
            }))
          }
          onTreatAsTextChange={(treatAsText) =>
            setFieldValue("matrixRunout", (draft) => ({
              ...draft.matrixRunout.value,
              treatAsText,
            }))
          }
          onFocus={() => onFocus("matrixRunout")}
          onBlur={() => onBlur("matrixRunout")}
        />

        <hr className={styles.sectionDivider} aria-hidden />

        <AddTagsFormSection
          tags={tagsAvailableForReleases}
          selectedTagIds={formState.selectedTags.value}
          onAddTag={addSelectedTag}
          onRemoveTag={removeSelectedTag}
        />

        <hr className={styles.sectionDivider} aria-hidden />

        <div className={styles.checkboxRow}>
          <input
            id="add-release-part-of-queen-collection"
            type="checkbox"
            checked={formState.partOfQueenCollection.value}
            disabled={entry.partOfQueenCollection}
            onChange={(e) =>
              setFieldValue("partOfQueenCollection", e.target.checked)
            }
          />
          <label
            className={styles.checkboxLabel}
            htmlFor="add-release-part-of-queen-collection"
          >
            Part of Queen collection
          </label>
        </div>

        {formState.partOfQueenCollection.value && (
          <div className={`${styles.field} ${styles.fieldMoreSpaceBefore}`}>
            <label
              className={styles.heading}
              htmlFor="add-release-relation-to-queen"
            >
              Relation to Queen
            </label>
            <textarea
              id="add-release-relation-to-queen"
              className={styles.textarea}
              value={formState.relationToQueen.value}
              onChange={(e) => setFieldValue("relationToQueen", e.target.value)}
              onFocus={() => onFocus("relationToQueen")}
              onBlur={() => onBlur("relationToQueen")}
              aria-describedby={
                hasRelationToQueenNotifications
                  ? RELATION_TO_QUEEN_FIELD_NOTIFICATIONS_ID
                  : undefined
              }
            />
            <FormFieldNotifications
              id={RELATION_TO_QUEEN_FIELD_NOTIFICATIONS_ID}
              messages={relationToQueenNotifications}
            />
          </div>
        )}

        <hr className={styles.sectionDivider} aria-hidden />

        <div className={styles.field}>
          <label className={styles.heading} htmlFor="add-release-comment">
            Comment
          </label>
          <textarea
            id="add-release-comment"
            className={styles.textarea}
            value={formState.comment.value}
            onChange={(e) => setFieldValue("comment", e.target.value)}
            onFocus={() => onFocus("comment")}
            onBlur={() => onBlur("comment")}
            aria-describedby={
              hasCommentNotifications
                ? COMMENT_FIELD_NOTIFICATIONS_ID
                : undefined
            }
          />
          <FormFieldNotifications
            id={COMMENT_FIELD_NOTIFICATIONS_ID}
            messages={commentNotifications}
          />
        </div>

        <div className={styles.field}>
          <label
            className={styles.heading}
            htmlFor="add-release-condition-problems"
          >
            Condition problems
          </label>
          <textarea
            id="add-release-condition-problems"
            className={styles.textarea}
            value={formState.conditionProblems.value}
            onChange={(e) => setFieldValue("conditionProblems", e.target.value)}
            onFocus={() => onFocus("conditionProblems")}
            onBlur={() => onBlur("conditionProblems")}
            aria-describedby={
              hasConditionProblemsNotifications
                ? CONDITION_PROBLEMS_FIELD_NOTIFICATIONS_ID
                : undefined
            }
          />
          <FormFieldNotifications
            id={CONDITION_PROBLEMS_FIELD_NOTIFICATIONS_ID}
            messages={conditionProblemsNotifications}
          />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClearFormState}
          >
            Clear Form
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            onMouseDown={(e) => e.preventDefault()}
          >
            Save
          </button>
        </div>
        {showSubmissionValidationError && (
          <p className={styles.submissionError} role="alert">
            Release submission failed due to validation errors, check the form
            values
          </p>
        )}
      </form>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        size="wide"
        title="Confirm new release"
        description={
          isConfirmOpen && (
            <>
              <ReleaseFormPreview
                formState={formState}
                allFormats={allFormats}
                tagsAvailableForReleases={tagsAvailableForReleases}
              />
              <DbSourcesCheckboxes
                heading="Save to databases"
                headingId="create-release-db-sources-heading"
                idPrefix="create-release-db-source"
                activeDbSource={dbSource}
                checkedSources={formState.dbSources.value}
                onToggle={handleToggleDbSource}
              />
            </>
          )
        }
        confirmLabel="Create release"
        cancelLabel="Back to edit"
        isBusy={isSubmitting}
        errorMessage={submitError}
        onConfirm={handleConfirmCreate}
        onCancel={handleCancelConfirm}
      />
    </div>
  );
};

export default ReleaseForm;

type CreateReleaseOutcome =
  | {
      source: DbSource;
      status: "fulfilled";
      notifications: string[];
    }
  | {
      source: DbSource;
      status: "rejected";
      reason: unknown;
    };

type CreateReleaseOutcomes = {
  releaseId: string | undefined;
  outcomes: CreateReleaseOutcome[];
};

const withReleaseId = (
  input: CreateMusicalReleaseInput,
  releaseId: string | undefined,
): CreateMusicalReleaseInput => ({
  ...input,
  release: {
    ...input.release,
    releaseId,
  },
});

const createReleasesAcrossDbSources = async (
  createInput: CreateMusicalReleaseInput,
  targets: ReadonlySet<DbSource>,
  primaryDbSource: DbSource,
): Promise<CreateReleaseOutcomes> => {
  // re-order targets to ensure the primary source comes first
  const orderedTargets = [
    primaryDbSource,
    ...Array.from(targets).filter((source) => source !== primaryDbSource),
  ];

  const outcomes: CreateReleaseOutcome[] = [];
  let sharedReleaseId: string | undefined;

  for (const source of orderedTargets) {
    const input = withReleaseId(createInput, sharedReleaseId);

    try {
      const result = await api.createMusicalRelease(input, source);
      sharedReleaseId ??= result.releaseId;

      outcomes.push({
        source,
        status: "fulfilled",
        notifications: result.notifications,
      });
    } catch (reason: unknown) {
      outcomes.push({
        source,
        status: "rejected",
        reason,
      });

      if (sharedReleaseId === undefined) {
        break;
      }
    }
  }

  return {
    releaseId: sharedReleaseId,
    outcomes,
  };
};

const formatCreateReleaseError = (reason: unknown): string =>
  reason instanceof Error ? reason.message : "Failed to create musical release";

const buildCreateReleaseFeedback = (
  outcomes: CreateReleaseOutcome[],
): { notifications: string[]; errors: string[] } => {
  const notifications: string[] = [];
  const errors: string[] = [];

  for (const outcome of outcomes) {
    if (outcome.status === "fulfilled") {
      notifications.push(...outcome.notifications);
    } else {
      const errorMessage = `Failed to create musical release in ${dbSourceLabel(outcome.source)}`;
      console.error(errorMessage, outcome.reason);

      errors.push(
        `${errorMessage}: ${formatCreateReleaseError(outcome.reason)}`,
      );
    }
  }

  return { notifications, errors };
};
