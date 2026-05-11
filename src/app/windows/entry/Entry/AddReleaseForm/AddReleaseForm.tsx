import { useState, type FC, type FormEvent } from "react";

import AddReleaseCatalogueNumbersSection from "./AddReleaseCatalogueNumbersSection";
import AddReleaseCountriesSection from "./AddReleaseCountriesSection";
import styles from "./AddReleaseForm.module.css";
import AddReleaseFormFormatsSection from "./AddReleaseFormFormatsSection";
import {
  removeMadeInCountrySelectionRowFromFieldErrors,
  stripPrintedInFromCountriesFieldErrors,
  isCatalogueNumbersInputFieldKey,
  isCountriesInputFieldKey,
  isFormatInputFieldKey,
  isReleaseDateInputFieldKey,
  type AddReleaseFormFieldErrors,
  type AddReleaseFormInputFieldKey,
  emptyMutableCountriesSubsectionErrors,
  initialAddReleaseFormFieldErrors,
} from "./addReleaseFormUtils/errorMessages";
import {
  defaultCatalogueNumberRow,
  defaultFormatInputRow,
  emptyCountrySelection,
  initialAddReleaseFormDraftValue,
  type AddReleaseFormDraft,
  type AddReleaseFormEntry,
} from "./addReleaseFormUtils/formValues";
import AddReleaseMatrixRunoutField from "./AddReleaseMatrixRunoutField";
import AddReleaseTagsSection from "./AddReleaseTagsSection";

import FormFieldErrorMessages from "@/app/components/FormFieldErrorMessages";
import FormFieldNotifications from "@/app/components/FormFieldNotifications";
import GeneralizedDateFormInput from "@/app/components/GeneralizedDateFormInput";
import type { CountryListItem } from "@/types/countries";
import type { ReleasesFormatListItem } from "@/types/formats";
import type { LabelListItem } from "@/types/labels";
import type { TagListItem } from "@/types/tags";
import { omitProperty } from "@/utils/common";

export type AddReleaseFormProps = {
  entry: AddReleaseFormEntry;
  allFormats: ReleasesFormatListItem[];
  labels: LabelListItem[];
  tags: TagListItem[];
  allCountries: CountryListItem[];
  onCancel: () => void;
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

const AddReleaseForm: FC<AddReleaseFormProps> = ({
  entry,
  onCancel,
  allFormats,
  labels,
  tags,
  allCountries,
}) => {
  const [form, setForm] = useState<AddReleaseFormDraft>(
    initialAddReleaseFormDraftValue(entry, allFormats),
  );

  const [fieldErrors, setFieldErrors] = useState<AddReleaseFormFieldErrors>(
    initialAddReleaseFormFieldErrors,
  );

  const [printedInCountriesSectionOpen, setPrintedInCountriesSectionOpen] =
    useState(false);

  const setFieldValue = <K extends keyof AddReleaseFormDraft>(
    key: K,
    value:
      | AddReleaseFormDraft[K]["value"]
      | ((prev: AddReleaseFormDraft) => AddReleaseFormDraft[K]["value"]),
  ) =>
    setForm((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: typeof value === "function" ? value(prev) : value,
      },
    }));

  const setField = <K extends keyof AddReleaseFormDraft>(
    key: K,
    value:
      | AddReleaseFormDraft[K]
      | ((prev: AddReleaseFormDraft) => AddReleaseFormDraft[K]),
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: typeof value === "function" ? value(prev) : value,
    }));
  };

  // on focus we attempt to remove errors related to the field that is being focused
  const onFocus = (key: AddReleaseFormInputFieldKey) => {
    if (
      typeof key === "string" && !isReleaseDateInputFieldKey(key)
    ) {
      setField(key, (prev) => ({
        ...prev[key],
        notifications: [],
      }));
    }

    setFieldErrors((prev) => {
      if (isFormatInputFieldKey(key)) {
        const { formats } = prev;
        const { formatRowId, field } = key;

        const nextFormatRowErrors = prev.formats[formatRowId]?.filter(
          (error) =>
            error.sources &&
            error.sources.length > 0 &&
            !error.sources.includes(field),
        );

        return {
          ...prev,
          formats: nextFormatRowErrors
            ? {
              ...formats,
              [formatRowId]: nextFormatRowErrors,
            }
            : omitProperty(formats, formatRowId),
        };
      }

      if (isCatalogueNumbersInputFieldKey(key)) {
        const { catalogueNumbers } = prev;
        const { catNumberRowId, field, inputValueId } = key;

        const rowErrors = catalogueNumbers[catNumberRowId];

        if (!rowErrors) {
          return prev;
        }

        const errorKey =
          field === "label"
            ? "labelInputErrorMessages"
            : "catNumberInputErrorMessages";

        const nextRowErrors = {
          ...rowErrors,
          [errorKey]: omitProperty(rowErrors[errorKey], inputValueId),
        };

        return {
          ...prev,
          catalogueNumbers: {
            ...catalogueNumbers,
            [catNumberRowId]: nextRowErrors,
          },
        };
      }

      if (isCountriesInputFieldKey(key)) {
        const { countries } = prev;
        const { countriesSubsection, rowId } = key;
        const subsection = countries[countriesSubsection];

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
          ...prev,
          countries: {
            ...countries,
            [countriesSubsection]: nextSubsection,
          },
        };
      }

      const errorKey = isReleaseDateInputFieldKey(key) ? "releaseDate" : key;

      const errors = prev[errorKey]?.filter(
        (error) =>
          error.sources &&
          error.sources.length > 0 &&
          !error.sources.includes(key),
      );

      return {
        ...prev,
        [errorKey]: errors,
      };
    });
  };

  const validateField = <K extends keyof AddReleaseFormDraft>(key: K) => {
    const formFieldData = form[key];

    // Correlated union: TS can't see that `value` and `validationFn`'s parameter
    // share the same K, so we narrow the call signature locally. Sound because
    // both fields come from the same `form[key]` instance.
    type ValueType = AddReleaseFormDraft[K]["value"];
    type ResultType = ReturnType<AddReleaseFormDraft[K]["validationFn"]>;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const validationFn = formFieldData.validationFn as (
      v: ValueType,
    ) => ResultType;
    const validationResult = validationFn(formFieldData.value);
    const { valid, value } = validationResult;

    setField(key, (prev) => ({
      ...prev[key],
      valid,
      value,
      notifications: validationResult.valid
        ? (validationResult.notifications ?? [])
        : [],
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [key]: validationResult.valid
        ? initialAddReleaseFormFieldErrors[key]
        : validationResult.errorMessages,
    }));

    return validationResult;
  };

  const onBlur = (key: keyof AddReleaseFormDraft) => validateField(key);

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
    setFieldErrors((prev) => ({
      ...prev,
      catalogueNumbers: omitProperty(prev.catalogueNumbers, rowId),
    }));

    setFieldValue("catalogueNumbers", (prev) =>
      prev.catalogueNumbers.value.filter((row) => row.id !== rowId),
    );
  };

  const addSelectedTag = (tagId: string, tag: string) => {
    setField("selectedTags", (prev) => ({
      ...prev.selectedTags,
      [tagId]: tag,
    }));
  };

  const removeSelectedTag = (tagId: string) => {
    setField("selectedTags", (prev) => ({
      ...prev.selectedTags,
      value: omitProperty(prev.selectedTags.value, tagId),
    }));
  };

  const addCountrySelectionRow = () => {
    setFieldValue("countries", (prev) => ({
      ...prev.countries.value,
      madeIn: [...prev.countries.value.madeIn, emptyCountrySelection()],
    }));
  };

  const removeCountrySelectionRow = (inputId: string) => {
    setFieldErrors((prev) => {
      const nextCountries = removeMadeInCountrySelectionRowFromFieldErrors(
        prev.countries,
        inputId,
      );

      if (nextCountries === prev.countries) {
        return prev;
      }

      return { ...prev, countries: nextCountries };
    });

    setFieldValue("countries", (prev) => ({
      ...prev.countries.value,
      madeIn: prev.countries.value.madeIn.filter((row) => row.id !== inputId),
    }));
  };

  const clearAllCountries = () => {
    setPrintedInCountriesSectionOpen(false);

    setFieldErrors((prev) => ({
      ...prev,
      countries: {
        madeIn: emptyMutableCountriesSubsectionErrors(),
        printedIn: emptyMutableCountriesSubsectionErrors(),
      },
    }));

    setFieldValue("countries", {
      madeIn: [],
      printedIn: [],
    });
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
    setPrintedInCountriesSectionOpen(true);
    setFieldValue("countries", (prev) => ({
      ...prev.countries.value,
      printedIn: [...prev.countries.value.printedIn, emptyCountrySelection()],
    }));
  };

  const closePrintedInCountriesSection = () => {
    setPrintedInCountriesSectionOpen(false);

    setFieldErrors((prev) => {
      const nextCountries = stripPrintedInFromCountriesFieldErrors(
        prev.countries,
      );

      if (nextCountries === prev.countries) {
        return prev;
      }

      return { ...prev, countries: nextCountries };
    });

    setFieldValue("countries", (prev) => ({
      ...prev.countries.value,
      printedIn: [...prev.countries.value.printedIn, emptyCountrySelection()],
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
    };

    const formIsValid = Object.values(validationResults).every(
      (result) => result.valid,
    );

    console.info({
      form,
      formIsValid,
    });

    if (!formIsValid) {
      return;
    }

    const {
      releaseVersion: { value: releaseVersion },
      discogsUrl: { value: discogsUrl },
      comment: { value: comment },
      conditionProblems: { value: conditionProblems },
      releaseDate: { value: releaseDate },
      countries: { value: countries },
      formats: { value: formats },
      catalogueNumbers: { value: catalogueNumbers },
      matrixRunout: { value: matrixRunout },
      selectedTags: { value: selectedTags },
      partOfQueenCollection: { value: partOfQueenCollection },
      relationToQueen: { value: relationToQueenDraft },
    } = validationResults;

    // The "relation to Queen" textarea is only visible when the
    // "part of Queen collection" checkbox is on, but its value is intentionally
    // kept across toggles for UX. Drop it before persisting so we never send
    // text the DB would reject (it requires partOfQueenCollection=true).
    const relationToQueen: string | null = partOfQueenCollection
      ? relationToQueenDraft
      : null;

    console.info({
      releaseVersion,
      discogsUrl,
      comment,
      conditionProblems,
      releaseDate,
      countries,
      formats,
      catalogueNumbers,
      matrixRunout,
      selectedTags,
      partOfQueenCollection,
      relationToQueen,
    });
  };

  const releaseVersionErrors = fieldErrors.releaseVersion;
  const releaseVersionNotifications = form.releaseVersion.notifications;
  const discogsUrlErrors = fieldErrors.discogsUrl;
  const discogsUrlNotifications = form.discogsUrl.notifications;
  const commentNotifications = form.comment.notifications;
  const conditionProblemsNotifications = form.conditionProblems.notifications;
  const relationToQueenNotifications = form.relationToQueen.notifications;
  const matrixRunoutErrors = fieldErrors.matrixRunout;
  const releaseDateErrors = fieldErrors.releaseDate;
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
            value={form.releaseVersion.value}
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

        <hr
          className={`${styles.sectionDivider} ${styles.sectionDividerMoreSpaceBefore}`}
          aria-hidden
        />

        <div className={styles.field}>
          <h2 className={styles.heading}>Release date</h2>
          <GeneralizedDateFormInput
            date={form.releaseDate.value}
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
            value={form.discogsUrl.value}
            onChange={(e) => setFieldValue("discogsUrl", e.target.value)}
            onFocus={() => onFocus("discogsUrl")}
            onBlur={() => onBlur("discogsUrl")}
            aria-invalid={hasDiscogsUrlErrors}
            aria-describedby={discogsUrlDescribedByIds || undefined}
            autoComplete="off"
            placeholder="https://www.discogs.com/release/<id>-..."
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

        <AddReleaseCountriesSection
          countries={allCountries}
          countrySelections={form.countries.value.madeIn}
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
          errors={fieldErrors.countries.madeIn}
        />

        {printedInCountriesSectionOpen ? (
          <AddReleaseCountriesSection
            countries={allCountries}
            countrySelections={form.countries.value.printedIn}
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
            errors={fieldErrors.countries.printedIn}
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

        <AddReleaseFormFormatsSection
          formatInputs={form.formats.value}
          releasesFormats={allFormats}
          errors={fieldErrors.formats}
          setFormats={(stateUpdateFn) =>
            setFieldValue("formats", (prev) =>
              stateUpdateFn(prev.formats.value),
            )
          }
          addFormatRow={addFormatRow}
          removeFormatRow={removeFormatRow}
          onFieldFocus={onFocus}
          onBlur={() => onBlur("formats")}
        />

        <hr className={styles.sectionDivider} aria-hidden />

        <AddReleaseCatalogueNumbersSection
          labels={labels}
          catalogueNumbers={form.catalogueNumbers.value}
          setCatalogueNumbers={(update) =>
            setFieldValue("catalogueNumbers", (prev) =>
              update(prev.catalogueNumbers.value),
            )
          }
          errors={fieldErrors.catalogueNumbers}
          addCatalogueNumbersRow={addCatalogueNumbersRow}
          removeCatalogueNumbersRow={removeCatalogueNumbersRow}
          onFieldFocus={onFocus}
          onBlurRowColumn={() => onBlur("catalogueNumbers")}
        />

        <hr className={styles.sectionDivider} aria-hidden />

        <AddReleaseMatrixRunoutField
          matrixRunout={form.matrixRunout.value}
          errorMessages={matrixRunoutErrors}
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

        <AddReleaseTagsSection
          tags={tags}
          selectedTags={form.selectedTags.value}
          onAddTag={addSelectedTag}
          onRemoveTag={removeSelectedTag}
        />

        <hr className={styles.sectionDivider} aria-hidden />

        <div className={styles.checkboxRow}>
          <input
            id="add-release-part-of-queen-collection"
            type="checkbox"
            checked={form.partOfQueenCollection.value}
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

        {form.partOfQueenCollection.value && (
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
              value={form.relationToQueen.value}
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
            value={form.comment.value}
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
            value={form.conditionProblems.value}
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
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" onMouseDown={(e) => e.preventDefault()}>
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddReleaseForm;
