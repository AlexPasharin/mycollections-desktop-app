import { useEffect, useState, type FC, type FormEvent } from "react";

import EditEntryAltNamesSection from "./EditEntryAltNamesSection";
import styles from "./EditEntryForm.module.css";
import EditEntryFormPreview from "./EditEntryFormPreview";
import {
  initialEditEntryFormFieldErrors,
  isAltNameInputFieldKey,
  type EditEntryFormInputFieldKey,
} from "./editEntryFormUtils/errorMessages";
import {
  defaultAltNameRow,
  initialEditEntryFormDraftValue,
  type EditEntryFormDraft,
  type EditEntryFormEntry,
} from "./editEntryFormUtils/formValues";
import { toUpdateMusicalEntryInput } from "./editEntryFormUtils/toUpdateMusicalEntryInput";
import EditEntryTypesSection from "./EditEntryTypesSection";

import ConfirmDialog from "@/app/components/ConfirmDialog";
import DbSourcesCheckboxes from "@/app/components/DbSourcesCheckboxes";
import AddTagsFormSection from "@/app/components/Form/AddTagsFormSection";
import FormFieldErrorMessages from "@/app/components/FormFieldErrorMessages";
import FormFieldNotifications from "@/app/components/FormFieldNotifications";
import GeneralizedDateFormInput from "@/app/components/GeneralizedDateFormInput";
import api from "@/app/windows/entry/api";
import type { DbSource } from "@/db/db-source";
import { ALL_DB_SOURCES, dbSourceLabel } from "@/db/db-source-options";
import type { EntryByIdResult, UpdateMusicalEntryInput } from "@/types/entries";
import type { EntryTypeListItem } from "@/types/entryTypes";
import type { TagListItem } from "@/types/tags";
import { isDateInputFieldKey, omitProperty } from "@/utils/common";
import { updateImmutableSet } from "@/utils/immutableSet";

export type EditEntryFormProps = {
  entry: EditEntryFormEntry;
  dbSource: DbSource;
  tags: TagListItem[];
  allEntryTypes: EntryTypeListItem[];
  onCancel: () => void;
  onEntryUpdated: (
    entry: EntryByIdResult,
    notifications: string[],
    errors: string[],
  ) => void;
};

const MAIN_NAME_FIELD_ERROR_ID = "edit-entry-main-name-error";
const ORIGINAL_RELEASE_DATE_FIELD_ERROR_ID =
  "edit-entry-original-release-date-error";
const DISCOGS_URL_FIELD_ERROR_ID = "edit-entry-discogs-url-error";
const DISCOGS_URL_FIELD_NOTIFICATIONS_ID =
  "edit-entry-discogs-url-notifications";
const COMMENT_FIELD_NOTIFICATIONS_ID = "edit-entry-comment-notifications";
const RELATION_TO_QUEEN_FIELD_NOTIFICATIONS_ID =
  "edit-entry-relation-to-queen-notifications";

const EditEntryForm: FC<EditEntryFormProps> = ({
  entry,
  dbSource,
  onCancel,
  onEntryUpdated,
  tags,
  allEntryTypes,
}) => {
  const [form, setForm] = useState<EditEntryFormDraft>(() =>
    initialEditEntryFormDraftValue(entry),
  );

  const [showSubmissionValidationError, setShowSubmissionValidationError] =
    useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [checkedDbSources, setCheckedDbSources] = useState<
    ReadonlySet<DbSource>
  >(() => new Set(ALL_DB_SOURCES));
  const [submitError, setSubmitError] = useState<string>();

  // will fire after successful entry update, since entry object will be substituted with it's latest version
  // this will update form default value
  useEffect(() => {
    setForm(initialEditEntryFormDraftValue(entry));
    setShowSubmissionValidationError(false);
    setIsConfirmOpen(false);
    setSubmitError(undefined);
  }, [entry]);

  const setFieldValue = <K extends keyof EditEntryFormDraft>(
    key: K,
    value:
      | EditEntryFormDraft[K]["value"]
      | ((prev: EditEntryFormDraft) => EditEntryFormDraft[K]["value"]),
  ) =>
    setForm((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: typeof value === "function" ? value(prev) : value,
      },
    }));

  const setField = <K extends keyof EditEntryFormDraft>(
    key: K,
    value:
      | EditEntryFormDraft[K]
      | ((prev: EditEntryFormDraft) => EditEntryFormDraft[K]),
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: typeof value === "function" ? value(prev) : value,
    }));
  };

  // on focus we attempt to remove errors and notifications related to the field that is being focused
  const onFocus = (key: EditEntryFormInputFieldKey) => {
    setShowSubmissionValidationError(false);

    if (isAltNameInputFieldKey(key)) {
      setField("altNames", (prev) => ({
        ...prev.altNames,
        errors: omitProperty(prev.altNames.errors, key.rowId),
        notifications: [],
      }));

      return;
    }

    const errorKey = isDateInputFieldKey(key) ? "originalReleaseDate" : key;

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

  const validateField = <K extends keyof EditEntryFormDraft>(key: K) => {
    const formFieldData = form[key];

    type ValueType = EditEntryFormDraft[K]["value"];
    type ResultType = ReturnType<EditEntryFormDraft[K]["validationFn"]>;

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
        ? initialEditEntryFormFieldErrors[key]
        : validationResult.errorMessages,
    }));

    return validationResult;
  };

  const onBlur = (key: keyof EditEntryFormDraft) => validateField(key);

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

  const addSelectedType = (typeId: string) => {
    setFieldValue("selectedTypes", (prev) =>
      new Set(prev.selectedTypes.value).add(typeId),
    );
  };

  const removeSelectedType = (typeId: string) => {
    setFieldValue("selectedTypes", (prev) => {
      const next = new Set(prev.selectedTypes.value);
      next.delete(typeId);

      return next;
    });
  };

  const addAltNameRow = () => {
    setFieldValue("altNames", (prev) => [
      ...prev.altNames.value,
      defaultAltNameRow(),
    ]);
  };

  const removeAltNameRow = (rowId: string) => {
    setField("altNames", (prev) => ({
      ...prev.altNames,
      value: prev.altNames.value.filter((row) => row.id !== rowId),
      errors: omitProperty(prev.altNames.errors, rowId),
    }));
  };

  const setAltNameValue = (rowId: string, name: string) => {
    setFieldValue("altNames", (prev) =>
      prev.altNames.value.map((row) =>
        row.id === rowId ? { ...row, name } : row,
      ),
    );
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validationResults = {
      mainName: validateField("mainName"),
      originalReleaseDate: validateField("originalReleaseDate"),
      discogsUrl: validateField("discogsUrl"),
      comment: validateField("comment"),
      selectedTags: validateField("selectedTags"),
      selectedTypes: validateField("selectedTypes"),
      altNames: validateField("altNames"),
      partOfQueenCollection: validateField("partOfQueenCollection"),
      relationToQueen: validateField("relationToQueen"),
    };

    const formIsValid = Object.values(validationResults).every(
      (result) => result.valid,
    );

    setShowSubmissionValidationError(!formIsValid);

    if (formIsValid) {
      setSubmitError(undefined);
      setCheckedDbSources(new Set(ALL_DB_SOURCES));
      setIsConfirmOpen(true);
    }
  };

  const handleToggleDbSource = (source: DbSource) => {
    setCheckedDbSources((prev) =>
      updateImmutableSet(source, prev.has(source) ? "remove" : "add")(prev),
    );
  };

  const handleConfirmSave = () => {
    if (isSubmitting) {
      return;
    }

    const {
      mainName: { value: mainName },
      originalReleaseDate: { value: originalReleaseDate },
      discogsUrl: { value: discogsUrl },
      comment: { value: comment },
      selectedTags: { value: selectedTags },
      selectedTypes: { value: selectedTypes },
      altNames: { value: altNames },
      partOfQueenCollection: { value: partOfQueenCollection },
      relationToQueen: { value: relationToQueen },
    } = form;

    const updateInput = toUpdateMusicalEntryInput({
      entry,
      mainName,
      originalReleaseDate,
      discogsUrl,
      comment,
      selectedTags,
      selectedTypes,
      altNames,
      partOfQueenCollection,
      relationToQueen,
    });

    setIsSubmitting(true);
    setSubmitError(undefined);

    updateEntryAcrossDbSources(updateInput, checkedDbSources, dbSource)
      .then(({ entry: updatedEntry, outcomes }) => {
        const { notifications, errors } = buildUpdateEntryFeedback(outcomes);

        setIsConfirmOpen(false);

        if (updatedEntry) {
          onEntryUpdated(updatedEntry, notifications, errors);
        } else if (errors.length > 0) {
          setSubmitError(errors.join("\n"));
        }
      })
      .catch((error: unknown) => {
        console.error("Failed to update musical entry", error);
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Failed to update musical entry",
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

  const mainNameErrors = form.mainName.errors;
  const originalReleaseDateErrors = form.originalReleaseDate.errors;
  const discogsUrlErrors = form.discogsUrl.errors;
  const discogsUrlNotifications = form.discogsUrl.notifications;
  const commentNotifications = form.comment.notifications;
  const relationToQueenNotifications = form.relationToQueen.notifications;
  const altNamesNotifications = form.altNames.notifications;
  const hasMainNameErrors = mainNameErrors.length > 0;
  const hasOriginalReleaseDateErrors = originalReleaseDateErrors.length > 0;
  const hasDiscogsUrlErrors = discogsUrlErrors.length > 0;
  const hasDiscogsUrlNotifications = discogsUrlNotifications.length > 0;
  const hasCommentNotifications = commentNotifications.length > 0;
  const hasRelationToQueenNotifications =
    relationToQueenNotifications.length > 0;

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
          <label className={styles.heading} htmlFor="edit-entry-main-name">
            Main name
            <sup className={styles.requiredMark} aria-hidden="true">
              *
            </sup>
          </label>
          <input
            id="edit-entry-main-name"
            className={styles.input}
            type="text"
            aria-required
            value={form.mainName.value}
            onChange={(e) => setFieldValue("mainName", e.target.value)}
            onFocus={() => onFocus("mainName")}
            onBlur={() => onBlur("mainName")}
            aria-invalid={hasMainNameErrors}
            aria-describedby={
              hasMainNameErrors ? MAIN_NAME_FIELD_ERROR_ID : undefined
            }
            autoComplete="off"
            required
          />
          <FormFieldErrorMessages
            id={MAIN_NAME_FIELD_ERROR_ID}
            messages={mainNameErrors}
          />
        </div>

        <hr
          className={`${styles.sectionDivider} ${styles.sectionDividerMoreSpaceBefore}`}
          aria-hidden
        />

        <div className={styles.field}>
          <h2 className={styles.heading}>Original release date</h2>
          <GeneralizedDateFormInput
            date={form.originalReleaseDate.value}
            setDate={(originalReleaseDate) =>
              setFieldValue("originalReleaseDate", originalReleaseDate)
            }
            onFocus={onFocus}
            onBlur={() => onBlur("originalReleaseDate")}
            invalid={hasOriginalReleaseDateErrors}
            groupErrorId={ORIGINAL_RELEASE_DATE_FIELD_ERROR_ID}
          />
          <FormFieldErrorMessages
            id={ORIGINAL_RELEASE_DATE_FIELD_ERROR_ID}
            messages={originalReleaseDateErrors}
          />
        </div>

        <hr
          className={`${styles.sectionDivider} ${styles.sectionDividerMoreSpaceBefore}`}
          aria-hidden
        />

        <div className={styles.field}>
          <label className={styles.heading} htmlFor="edit-entry-discogs-url">
            Discogs URL
          </label>
          <input
            id="edit-entry-discogs-url"
            className={styles.input}
            type="url"
            value={form.discogsUrl.value}
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

        <AddTagsFormSection
          tags={tags}
          selectedTagIds={form.selectedTags.value}
          onAddTag={addSelectedTag}
          onRemoveTag={removeSelectedTag}
        />

        <hr className={styles.sectionDivider} aria-hidden />

        <EditEntryTypesSection
          allEntryTypes={allEntryTypes}
          selectedTypeIds={form.selectedTypes.value}
          onAddType={addSelectedType}
          onRemoveType={removeSelectedType}
        />

        <hr className={styles.sectionDivider} aria-hidden />

        <EditEntryAltNamesSection
          altNames={form.altNames.value}
          errors={form.altNames.errors}
          onChangeName={setAltNameValue}
          onAddRow={addAltNameRow}
          onRemoveRow={removeAltNameRow}
          onFocus={(rowId) => onFocus({ rowId })}
          onBlur={() => onBlur("altNames")}
        />
        <FormFieldNotifications
          id={DISCOGS_URL_FIELD_NOTIFICATIONS_ID}
          messages={altNamesNotifications}
        />

        <hr className={styles.sectionDivider} aria-hidden />

        <div className={styles.checkboxRow}>
          <input
            id="edit-entry-part-of-queen-collection"
            type="checkbox"
            checked={form.partOfQueenCollection.value}
            onChange={(e) => {
              const checked = e.target.checked;
              setFieldValue("partOfQueenCollection", checked);

              if (!checked) {
                setFieldValue("relationToQueen", "");
              }
            }}
          />
          <label
            className={styles.checkboxLabel}
            htmlFor="edit-entry-part-of-queen-collection"
          >
            Part of Queen collection
          </label>
        </div>

        {form.partOfQueenCollection.value && (
          <div className={`${styles.field} ${styles.fieldMoreSpaceBefore}`}>
            <label
              className={styles.heading}
              htmlFor="edit-entry-relation-to-queen"
            >
              Relation to Queen
            </label>
            <textarea
              id="edit-entry-relation-to-queen"
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
          <label className={styles.heading} htmlFor="edit-entry-comment">
            Comment
          </label>
          <textarea
            id="edit-entry-comment"
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

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
          >
            Cancel
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
            Entry submission failed due to validation errors, check the form
            values
          </p>
        )}
      </form>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        size="wide"
        title="Confirm entry changes"
        description={
          isConfirmOpen && (
            <>
              <EditEntryFormPreview
                form={form}
                tags={tags}
                allEntryTypes={allEntryTypes}
              />
              <DbSourcesCheckboxes
                heading="Save to databases"
                headingId="update-entry-db-sources-heading"
                idPrefix="update-entry-db-source"
                activeDbSource={dbSource}
                checkedSources={checkedDbSources}
                onToggle={handleToggleDbSource}
              />
            </>
          )
        }
        confirmLabel="Save entry"
        cancelLabel="Back to edit"
        isBusy={isSubmitting}
        errorMessage={submitError}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelConfirm}
      />
    </div>
  );
};

export default EditEntryForm;

type UpdateEntryOutcome =
  | {
      source: DbSource;
      status: "fulfilled";
      entry: EntryByIdResult;
      notifications: string[];
    }
  | {
      source: DbSource;
      status: "rejected";
      reason: unknown;
    };

type UpdateEntryOutcomes = {
  entry: EntryByIdResult | undefined;
  outcomes: UpdateEntryOutcome[];
};

const buildAltNameIdsMap = (
  inputAltNames: UpdateMusicalEntryInput["altNames"],
  updatedAltNames: EntryByIdResult["altNames"],
): AltNameIdMap => {
  const map = new Map<AltName, AltNameId>();

  for (const inputAltName of inputAltNames) {
    if (inputAltName.nameId !== undefined) {
      continue;
    }

    const trimmedName = inputAltName.name.trim();
    const match = updatedAltNames.find(
      (altName) => altName.name.trim() === trimmedName,
    );

    if (match) {
      map.set(trimmedName, match.nameId);
    }
  }

  return map;
};

const withSharedAltNameIds = (
  input: UpdateMusicalEntryInput,
  sharedAltNameIds: AltNameIdMap | undefined,
): UpdateMusicalEntryInput => ({
  ...input,
  altNames: input.altNames.map((altName) => {
    if (altName.nameId !== undefined) {
      return altName;
    }

    const nameId = sharedAltNameIds?.get(altName.name.trim());

    return nameId === undefined ? altName : { nameId, name: altName.name };
  }),
});

type AltName = string;
type AltNameId = string;
type AltNameIdMap = Map<AltName, AltNameId>;

const updateEntryAcrossDbSources = async (
  updateInput: UpdateMusicalEntryInput,
  targets: ReadonlySet<DbSource>,
  primaryDbSource: DbSource,
): Promise<UpdateEntryOutcomes> => {
  const orderedTargets = [
    primaryDbSource,
    ...Array.from(targets).filter((source) => source !== primaryDbSource),
  ];

  const outcomes: UpdateEntryOutcome[] = [];
  let updatedEntry: EntryByIdResult | undefined;
  let sharedAltNameIds: AltNameIdMap | undefined;

  for (const source of orderedTargets) {
    const input = withSharedAltNameIds(updateInput, sharedAltNameIds);

    try {
      const result = await api.updateMusicalEntry(input, source);
      updatedEntry = updatedEntry ?? result.entry;

      sharedAltNameIds ??= buildAltNameIdsMap(
        updateInput.altNames,
        result.entry.altNames,
      );

      outcomes.push({
        source,
        status: "fulfilled",
        entry: result.entry,
        notifications: result.notifications,
      });
    } catch (reason: unknown) {
      outcomes.push({
        source,
        status: "rejected",
        reason,
      });

      if (updatedEntry === undefined) {
        break;
      }
    }
  }

  return {
    entry: updatedEntry,
    outcomes,
  };
};

const formatUpdateEntryError = (reason: unknown): string =>
  reason instanceof Error ? reason.message : "Failed to update musical entry";

const buildUpdateEntryFeedback = (
  outcomes: UpdateEntryOutcome[],
): { notifications: string[]; errors: string[] } => {
  const notifications: string[] = [];
  const errors: string[] = [];

  for (const outcome of outcomes) {
    if (outcome.status === "fulfilled") {
      notifications.push(...outcome.notifications);
    } else {
      const errorMessage = `Failed to update musical entry in ${dbSourceLabel(outcome.source)}`;
      console.error(errorMessage, outcome.reason);

      errors.push(`${errorMessage}: ${formatUpdateEntryError(outcome.reason)}`);
    }
  }

  return { notifications, errors };
};
