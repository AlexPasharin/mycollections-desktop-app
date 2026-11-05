import {
  useEffect,
  useEffectEvent,
  useState,
  type FC,
  type SubmitEvent,
} from "react";

import ReleaseCatalogueNumbersSection from "./ReleaseCatalogueNumbersSection";
import ReleaseCountriesSection from "./ReleaseCountriesSection";
import ReleaseMatrixRunoutField from "./ReleaseMatrixRunoutField";
import ReleaseNameField from "./ReleaseNameField";
import ReleaseRelatedReleasesSection from "./ReleaseRelatedReleasesSection";
import UpsertReleaseFormFormatsSection from "./UpsertReleaseFormFormatsSection";
import UpsertReleaseFormPreview from "./UpsertReleaseFormPreview";
import {
  isCatalogueNumbersInputFieldKey,
  isCountriesInputFieldKey,
  isFormatInputFieldKey,
  isRelatedReleasesInputFieldKey,
  type UpsertReleaseFormInputFieldKey,
} from "./upsertReleaseFormUtils/errorMessages";
import {
  defaultCatalogueNumberRow,
  defaultFormatInputRow,
  defaultRelatedReleaseRow,
  emptyCountrySelection,
  initialUpsertReleaseFormStateValue,
  type UpsertReleaseFormEntry,
  type UpsertReleaseFormDraft,
  type UpsertReleaseFormInitialState,
  type UpsertReleaseFormState,
  type ValidatedUpsertReleaseFormDraft,
} from "./upsertReleaseFormUtils/formValues";
import { toUpsertMusicalReleaseInput } from "./upsertReleaseFormUtils/toUpsertMusicalReleaseInput";

import type {
  UpsertReleaseFormTabCreateModeSharedData,
  UpsertReleaseFormTabUpdateModeSharedData,
} from "../types";

import ConfirmDialog from "@/app/components/ConfirmDialog";
import DbSourcesCheckboxes from "@/app/components/DbSourcesCheckboxes";
import ErrorMessages from "@/app/components/ErrorMessages";
import FeedbackSection2 from "@/app/components/FeedbackSection2";
import AddTagsFormSection from "@/app/components/Form/AddTagsFormSection";
import FormSectionsDivider from "@/app/components/Form/FormSectionsDivider";
import GeneralizedDateFormInput from "@/app/components/GeneralizedDateFormInput";
import NotificationMessages2 from "@/app/components/NotificationMessages2";
import api from "@/app/windows/entry/api";
import type { DbSource } from "@/db/db-source";
import { dbSourceLabel } from "@/db/db-source-options";
import useFormState from "@/hooks/useFormState";
import type { CountryListItem } from "@/types/countries";
import type { ReleasesFormatListItem } from "@/types/formats";
import type { LabelListItem } from "@/types/labels";
import type { CreateMusicalReleaseInput } from "@/types/releases";
import type { TagListItem } from "@/types/tags";
import { isDateInputFieldKey } from "@/utils/common";
import { updateImmutableSet } from "@/utils/immutableSet";
import { getNextOrderNumber } from "@/utils/relatedItems";

export type UpsertReleaseFormTabData =
  | (UpsertReleaseFormTabCreateModeSharedData & {
      onReleaseCreated: (
        releaseId: string | undefined,
        notifications: string[],
        errors: string[],
      ) => void;
    })
  | (UpsertReleaseFormTabUpdateModeSharedData & {
      onReleaseUpdated: (
        releaseId: string,
        notifications: string[],
        errors: string[],
      ) => void;
    });

export type UpsertReleaseFormProps = {
  dbSources: ReadonlySet<DbSource>;
  setDbSources: (dbSources: ReadonlySet<DbSource>) => void;
  entry: UpsertReleaseFormEntry;
  primaryDbSource: DbSource;
  allFormats: ReleasesFormatListItem[];
  labels: LabelListItem[];
  tagsAvailableForReleases: TagListItem[];
  allCountries: CountryListItem[];
  initialFormState: UpsertReleaseFormInitialState;
  onPersistFormState: (state: UpsertReleaseFormInitialState) => void;
  tabData: UpsertReleaseFormTabData;
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

const fieldClassName = "mb-[0.65rem] flex flex-col gap-[0.35rem]";
const headingClassName = "m-0 mb-3 text-[1em] font-semibold leading-[1.35]";
export const cancelButtonClassName =
  "cursor-pointer rounded-md border border-[#bcbcbc] bg-white px-[0.9rem] py-[0.35rem] font-medium text-[#333] hover:enabled:border-[#9a9a9a] hover:enabled:bg-[#f1f1f1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a5fb4]";
const inputClassName = "px-2 py-[0.35rem] text-[1em]";
const textareaClassName =
  "min-h-[4.5rem] resize-y px-2 py-[0.35rem] text-[1em] [font:inherit] leading-[1.35]";

const UpsertReleaseForm: FC<UpsertReleaseFormProps> = ({
  entry,
  primaryDbSource,
  allFormats,
  labels,
  tagsAvailableForReleases,
  allCountries,
  initialFormState,
  onPersistFormState,
  tabData,
  dbSources,
  setDbSources,
}) => {
  const isUpdateMode = tabData.mode === "update";

  const [showSubmissionValidationError, setShowSubmissionValidationError] =
    useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  const {
    formState,
    setFieldValue: setFieldStateValue,
    clearFieldFeedback,
    validateField,
    validateForm,
    resetFormState,
    toInitialFormStateValue,
  } = useFormState({ initialValue: initialFormState });

  const [validatedForm, setValidatedForm] =
    useState<ValidatedUpsertReleaseFormDraft | null>(null);

  const discardChanges = () => {
    resetFormState(
      initialUpsertReleaseFormStateValue({
        entry,
        allFormats,
        allCountries,
        mode: tabData.mode,
      }),
    );
  };

  const persistState = useEffectEvent(() => {
    onPersistFormState(toInitialFormStateValue());
  });

  useEffect(() => {
    return persistState;
  }, []);

  const setFieldValue = <K extends keyof UpsertReleaseFormDraft>(
    key: K,
    value:
      | UpsertReleaseFormDraft[K]
      | ((prev: UpsertReleaseFormState) => UpsertReleaseFormDraft[K]),
  ) => {
    setFieldStateValue(key, typeof value === "function" ? value : () => value);
    setShowSubmissionValidationError(false);
  };

  // on focus we attempt to remove errors related to the field that is being focused
  const onFocus = (key: UpsertReleaseFormInputFieldKey) => {
    setShowSubmissionValidationError(false);

    if (isFormatInputFieldKey(key)) {
      clearFieldFeedback("formats", key.formatRowId);

      return;
    }

    if (isCatalogueNumbersInputFieldKey(key)) {
      clearFieldFeedback("catalogueNumbers", key.catNumberRowId);

      return;
    }

    if (isCountriesInputFieldKey(key)) {
      clearFieldFeedback("countries", key.rowId);

      return;
    }

    if (isRelatedReleasesInputFieldKey(key)) {
      clearFieldFeedback("relatedReleases", key.relatedReleaseRowId);

      return;
    }

    clearFieldFeedback(isDateInputFieldKey(key) ? "releaseDate" : key);
  };

  const onBlur = (key: keyof UpsertReleaseFormDraft) => validateField(key);

  const addFormatRow = () => {
    setFieldValue("formats", (prev) => [
      ...prev.formats.value,
      defaultFormatInputRow(),
    ]);
  };

  const removeFormatRow = (rowId: string) => {
    clearFieldFeedback("formats", rowId);

    setFieldValue("formats", (prev) =>
      prev.formats.value.filter((formatRow) => formatRow.id !== rowId),
    );
  };

  const addCatalogueNumbersRow = () => {
    setFieldValue("catalogueNumbers", (prev) =>
      prev.catalogueNumbers.value.activeTab === "json"
        ? prev.catalogueNumbers.value
        : {
            ...prev.catalogueNumbers.value,
            rows: [
              ...prev.catalogueNumbers.value.rows,
              defaultCatalogueNumberRow(),
            ],
          },
    );
  };

  const removeCatalogueNumbersRow = (rowId: string) => {
    clearFieldFeedback("catalogueNumbers", rowId);

    setFieldValue("catalogueNumbers", (prev) =>
      prev.catalogueNumbers.value.activeTab === "json"
        ? prev.catalogueNumbers.value
        : {
            ...prev.catalogueNumbers.value,
            rows: prev.catalogueNumbers.value.rows.filter(
              (row) => row.id !== rowId,
            ),
          },
    );
  };

  const addSelectedTag = (tagId: string) => {
    setFieldValue("selectedTags", (prev) =>
      new Set(prev.selectedTags.value).add(tagId),
    );
  };

  const removeSelectedTag = (tagId: string) => {
    clearFieldFeedback("selectedTags", tagId);

    setFieldValue("selectedTags", (prev) => {
      const next = new Set(prev.selectedTags.value);
      next.delete(tagId);

      return next;
    });
  };

  const addRelatedReleaseRow = () => {
    setFieldValue("relatedReleases", (prev) => [
      ...prev.relatedReleases.value,
      defaultRelatedReleaseRow(getNextOrderNumber(prev.relatedReleases.value)),
    ]);
  };

  const removeRelatedReleaseRow = (rowId: string) => {
    clearFieldFeedback("relatedReleases", rowId);

    setFieldValue("relatedReleases", (prev) =>
      prev.relatedReleases.value.filter((row) => row.id !== rowId),
    );
  };

  const setRelatedReleaseId = (rowId: string, releaseId: string) => {
    setFieldValue("relatedReleases", (prev) =>
      prev.relatedReleases.value.map((row) =>
        row.id === rowId ? { ...row, releaseId } : row,
      ),
    );
  };

  const setRelatedReleaseOrderNumber = (rowId: string, orderNumber: string) => {
    setFieldValue("relatedReleases", (prev) =>
      prev.relatedReleases.value.map((row) =>
        row.id === rowId ? { ...row, orderNumber } : row,
      ),
    );
  };

  const addCountrySelectionRow = () => {
    setFieldValue("countries", (prev) => ({
      ...prev.countries.value,
      madeIn: [...prev.countries.value.madeIn, emptyCountrySelection()],
    }));
  };

  const removeCountrySelectionRow = (inputId: string) => {
    clearFieldFeedback("countries", inputId);

    setFieldValue("countries", (prev) => ({
      ...prev.countries.value,
      madeIn: prev.countries.value.madeIn.filter((row) => row.id !== inputId),
    }));
  };

  const clearAllCountries = () => {
    clearFieldFeedback("countries");

    setFieldValue("countries", () => ({
      madeIn: [],
      printedIn: [],
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
    clearFieldFeedback("countries", "printedIn");

    setFieldValue("countries", (prev) => ({
      ...prev.countries.value,
      printedIn: [],
    }));
  };

  const addPrintedInCountrySelectionRow = () => {
    setFieldValue("countries", (prev) => ({
      ...prev.countries.value,
      printedIn: [...prev.countries.value.printedIn, emptyCountrySelection()],
    }));
  };

  const removePrintedInCountrySelectionRow = (inputId: string) => {
    clearFieldFeedback("countries", inputId);

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

  const countriesErrorsFor = (subsection: "madeIn" | "printedIn") => {
    const rowIds = formState.countries.value[subsection].map((row) => row.id);

    return formState.countries.errors.filter(
      (error) =>
        error.sources?.includes(subsection) === true ||
        rowIds.some((rowId) => error.sources?.includes(rowId) === true),
    );
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    console.info("releaseId", tabData.releaseId);

    const validationResults = validateForm();
    const formIsValid = validationResults !== null;
    setValidatedForm(validationResults);

    setShowSubmissionValidationError(!formIsValid);

    if (formIsValid) {
      setSubmitError(undefined);
      setIsConfirmOpen(true);
    }
  };

  const handleToggleDbSource = (source: DbSource) => {
    setDbSources(
      updateImmutableSet(
        source,
        dbSources.has(source) ? "remove" : "add",
      )(dbSources),
    );
  };

  const handleConfirmSave = () => {
    if (isSubmitting) {
      return;
    }

    if (validatedForm === null) {
      setSubmitError("Form validation failed, check the form values");

      return;
    }

    setIsSubmitting(true);
    setSubmitError(undefined);

    const upsertInput = toUpsertMusicalReleaseInput({
      ...validatedForm,
      entry,
    });

    // re-order targets to ensure the primary source comes first
    const orderedTargets = [
      primaryDbSource,
      ...Array.from(dbSources).filter((source) => source !== primaryDbSource),
    ];
    const savePromise = isUpdateMode
      ? updateReleasesAcrossDbSources(
          tabData.releaseId,
          upsertInput,
          orderedTargets,
        )
      : createReleasesAcrossDbSources(upsertInput, orderedTargets);

    savePromise
      .then(({ releaseId, outcomes }) => {
        const { notifications, errors } = buildSaveReleaseFeedback(
          outcomes,
          false,
        );

        console.info(
          isUpdateMode ? "Updated musical release" : "Created musical release",
          {
            releaseId,
            notifications,
            errors,
            outcomes,
          },
        );

        setIsConfirmOpen(false);

        if (isUpdateMode) {
          if (releaseId) {
            tabData.onReleaseUpdated(releaseId, notifications, errors);
          }
        } else {
          tabData.onReleaseCreated(releaseId, notifications, errors);
        }
      })
      .catch((error: unknown) => {
        console.error(
          isUpdateMode
            ? "Failed to update musical release"
            : "Failed to create musical release",
          error,
        );
        setSubmitError(
          error instanceof Error
            ? error.message
            : isUpdateMode
              ? "Failed to update musical release"
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
    .filter((id) => id !== null)
    .join(" ");

  const discogsUrlDescribedByIds = [
    hasDiscogsUrlErrors ? DISCOGS_URL_FIELD_ERROR_ID : null,
    hasDiscogsUrlNotifications ? DISCOGS_URL_FIELD_NOTIFICATIONS_ID : null,
  ]
    .filter((id) => id !== null)
    .join(" ");

  return (
    <>
      <FormSectionsDivider />

      <form onSubmit={handleSubmit}>
        <div className={fieldClassName}>
          <label className={headingClassName} htmlFor="add-release-version">
            Release version
            <sup
              className="ml-[0.25em] text-[1.1em] leading-none font-semibold"
              aria-hidden="true"
            >
              *
            </sup>
          </label>
          <input
            id="add-release-version"
            className={inputClassName}
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
          <FeedbackSection2
            notificationsId={RELEASE_VERSION_FIELD_NOTIFICATIONS_ID}
            errorsId={RELEASE_VERSION_FIELD_ERROR_ID}
            notifications={releaseVersionNotifications}
            errors={releaseVersionErrors}
          />
        </div>

        <ReleaseNameField
          entryMainName={entry.mainName}
          entryAltNames={entry.altNames}
          value={formState.name.value}
          onChange={(value) => setFieldValue("name", value)}
        />

        <FormSectionsDivider />

        <div className={fieldClassName}>
          <h2 className={headingClassName}>Release date</h2>
          <GeneralizedDateFormInput
            date={formState.releaseDate.value}
            startDate={entry.originalReleaseDate}
            setDate={(releaseDate) => setFieldValue("releaseDate", releaseDate)}
            onFocus={onFocus}
            onBlur={() => onBlur("releaseDate")}
            invalid={hasReleaseDateErrors}
            groupErrorId={RELEASE_DATE_FIELD_ERROR_ID}
          />
          <ErrorMessages
            id={RELEASE_DATE_FIELD_ERROR_ID}
            messages={releaseDateErrors}
          />
        </div>

        <FormSectionsDivider />

        <div className={fieldClassName}>
          <label className={headingClassName} htmlFor="add-release-discogs-url">
            Discogs URL
          </label>
          <input
            id="add-release-discogs-url"
            className={inputClassName}
            type="url"
            value={formState.discogsUrl.value}
            placeholder="https://www.discogs.com/release/<id>..."
            onChange={(e) => setFieldValue("discogsUrl", e.target.value)}
            onFocus={() => onFocus("discogsUrl")}
            onBlur={() => onBlur("discogsUrl")}
            aria-invalid={hasDiscogsUrlErrors}
            aria-describedby={discogsUrlDescribedByIds || undefined}
            autoComplete="off"
          />
          <ErrorMessages
            id={DISCOGS_URL_FIELD_ERROR_ID}
            messages={discogsUrlErrors}
          />
          <NotificationMessages2
            id={DISCOGS_URL_FIELD_NOTIFICATIONS_ID}
            messages={discogsUrlNotifications}
          />
        </div>

        <FormSectionsDivider />

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
          errors={countriesErrorsFor("madeIn")}
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
            errors={countriesErrorsFor("printedIn")}
          />
        ) : (
          <button
            type="button"
            className="mt-3 block cursor-pointer border-none bg-transparent px-0 py-1 text-left text-[0.92em] text-[#1a5fb4] underline hover:text-[#0d3d82]"
            onClick={openPrintedInCountriesSection}
          >
            Add &quot;printed in&quot; countries
          </button>
        )}

        <FormSectionsDivider />

        <UpsertReleaseFormFormatsSection
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

        <FormSectionsDivider />

        <ReleaseCatalogueNumbersSection
          labels={labels}
          catalogueNumbers={formState.catalogueNumbers.value}
          setCatalogueNumbers={(update) =>
            setFieldValue("catalogueNumbers", (prev) =>
              update(prev.catalogueNumbers.value),
            )
          }
          errors={formState.catalogueNumbers.errors}
          notifications={formState.catalogueNumbers.notifications}
          addCatalogueNumbersRow={addCatalogueNumbersRow}
          removeCatalogueNumbersRow={removeCatalogueNumbersRow}
          onFieldFocus={onFocus}
          onBlurRowColumn={() => onBlur("catalogueNumbers")}
          onJsonInputFocus={() => onFocus("catalogueNumbers")}
          onJsonInputBlur={() => onBlur("catalogueNumbers")}
        />

        <FormSectionsDivider />

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

        <FormSectionsDivider />

        <AddTagsFormSection
          tags={tagsAvailableForReleases}
          selectedTagIds={formState.selectedTags.value}
          onAddTag={addSelectedTag}
          onRemoveTag={removeSelectedTag}
        />

        <FormSectionsDivider />

        <ReleaseRelatedReleasesSection
          relatedReleases={formState.relatedReleases.value}
          errors={formState.relatedReleases.errors}
          notifications={formState.relatedReleases.notifications}
          onChangeReleaseId={setRelatedReleaseId}
          onChangeOrderNumber={setRelatedReleaseOrderNumber}
          onAddRow={addRelatedReleaseRow}
          onRemoveRow={removeRelatedReleaseRow}
          onFocus={(rowId) => onFocus({ relatedReleaseRowId: rowId })}
          onBlur={() => onBlur("relatedReleases")}
        />

        <FormSectionsDivider />

        <div className="mt-[0.15rem] flex items-start gap-2">
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
            className="m-0 leading-[1.35] font-normal"
            htmlFor="add-release-part-of-queen-collection"
          >
            Part of Queen collection
          </label>
        </div>

        {formState.partOfQueenCollection.value && (
          <div className={`${fieldClassName} mt-[0.85rem]`}>
            <label
              className={headingClassName}
              htmlFor="add-release-relation-to-queen"
            >
              Relation to Queen
            </label>
            <textarea
              id="add-release-relation-to-queen"
              className={textareaClassName}
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
            <NotificationMessages2
              id={RELATION_TO_QUEEN_FIELD_NOTIFICATIONS_ID}
              messages={relationToQueenNotifications}
            />
          </div>
        )}

        <FormSectionsDivider />

        <div className={fieldClassName}>
          <label className={headingClassName} htmlFor="add-release-comment">
            Comment
          </label>
          <textarea
            id="add-release-comment"
            className={textareaClassName}
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
          <NotificationMessages2
            id={COMMENT_FIELD_NOTIFICATIONS_ID}
            messages={commentNotifications}
          />
        </div>

        <div className={fieldClassName}>
          <label
            className={headingClassName}
            htmlFor="add-release-condition-problems"
          >
            Condition problems
          </label>
          <textarea
            id="add-release-condition-problems"
            className={textareaClassName}
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
          <NotificationMessages2
            id={CONDITION_PROBLEMS_FIELD_NOTIFICATIONS_ID}
            messages={conditionProblemsNotifications}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className={cancelButtonClassName}
            onClick={discardChanges}
          >
            Discard changes
          </button>
          <button
            type="submit"
            className="cursor-pointer rounded-md border border-[#154f96] bg-[#1a5fb4] px-[0.9rem] py-[0.35rem] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a5fb4] hover:enabled:bg-[#154f96] disabled:cursor-not-allowed disabled:border-[#bcbcbc] disabled:bg-[#d6d6d6] disabled:text-[#6b6b6b]"
            onMouseDown={(e) => e.preventDefault()}
          >
            Save
          </button>
        </div>
        {showSubmissionValidationError && (
          <p
            className="m-0 mt-[0.6rem] text-[0.9em] text-[#b42318]"
            role="alert"
          >
            Release submission failed due to validation errors, check the form
            values
          </p>
        )}
      </form>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        size="wide"
        title={isUpdateMode ? "Confirm release update" : "Confirm new release"}
        description={
          isConfirmOpen &&
          validatedForm && (
            <>
              <UpsertReleaseFormPreview
                formState={validatedForm}
                allFormats={allFormats}
                tagsAvailableForReleases={tagsAvailableForReleases}
              />
              <DbSourcesCheckboxes
                heading={
                  isUpdateMode ? "Update in databases" : "Save to databases"
                }
                headingId={
                  isUpdateMode
                    ? "update-release-db-sources-heading"
                    : "create-release-db-sources-heading"
                }
                idPrefix={
                  isUpdateMode
                    ? "update-release-db-source"
                    : "create-release-db-source"
                }
                activeDbSource={primaryDbSource}
                checkedSources={dbSources}
                onToggle={handleToggleDbSource}
              />
            </>
          )
        }
        confirmLabel={isUpdateMode ? "Update release" : "Create release"}
        cancelLabel="Back to edit"
        isBusy={isSubmitting}
        errorMessage={submitError}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelConfirm}
      />
    </>
  );
};

export default UpsertReleaseForm;

type SaveReleaseOutcome =
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
  targets: DbSource[],
) => {
  const outcomes: SaveReleaseOutcome[] = [];
  let sharedReleaseId: string | undefined;

  for (const source of targets) {
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

const updateReleasesAcrossDbSources = async (
  releaseId: string,
  updateInput: ReturnType<typeof toUpsertMusicalReleaseInput>,
  targets: DbSource[],
) => {
  const { release, formats, tagIds, relatedReleases } = updateInput;

  const outcomes = await Promise.all(
    targets.map(async (source): Promise<SaveReleaseOutcome> => {
      try {
        const result = await api.updateMusicalRelease(
          {
            releaseId,
            release,
            formats,
            tagIds,
            relatedReleases,
          },
          source,
        );

        return {
          source,
          status: "fulfilled",
          notifications: result.notifications,
        };
      } catch (reason: unknown) {
        return {
          source,
          status: "rejected",
          reason,
        };
      }
    }),
  );

  return {
    releaseId,
    outcomes,
  };
};

const formatSaveReleaseError = (
  reason: unknown,
  isUpdateMode: boolean,
): string =>
  reason instanceof Error
    ? reason.message
    : isUpdateMode
      ? "Failed to update musical release"
      : "Failed to create musical release";

const buildSaveReleaseFeedback = (
  outcomes: SaveReleaseOutcome[],
  isUpdateMode: boolean,
): { notifications: string[]; errors: string[] } => {
  const notifications: string[] = [];
  const errors: string[] = [];
  const actionLabel = isUpdateMode ? "update" : "create";

  for (const outcome of outcomes) {
    if (outcome.status === "fulfilled") {
      notifications.push(...outcome.notifications);
    } else {
      const errorMessage = `Failed to ${actionLabel} musical release in ${dbSourceLabel(outcome.source)}`;
      console.error(errorMessage, outcome.reason);

      errors.push(
        `${errorMessage}: ${formatSaveReleaseError(outcome.reason, isUpdateMode)}`,
      );
    }
  }

  return { notifications, errors };
};
