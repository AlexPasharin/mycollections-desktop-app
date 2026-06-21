import { useEffect, useRef, useState, type FC, type FormEvent } from "react";

import UpsertEntryAltNamesSection from "./UpsertEntryAltNamesSection";
import UpsertEntryFormPreview from "./UpsertEntryFormPreview";
import {
  initialUpsertEntryFormFieldErrors,
  isAltNameInputFieldKey,
  type UpsertEntryFormInputFieldKey,
} from "./upsertEntryFormUtils/errorMessages";
import {
  defaultAltNameRow,
  initialUpsertEntryFormDraftForCreate,
  initialUpsertEntryFormDraftValue,
  type UpsertEntryFormDraft,
  type UpsertEntryFormEntry,
  type UpsertEntryFormPersistedState,
} from "./upsertEntryFormUtils/formValues";
import { toCreateMusicalEntryInput } from "./upsertEntryFormUtils/toCreateMusicalEntryInput";
import { toUpdateMusicalEntryInput } from "./upsertEntryFormUtils/toUpdateMusicalEntryInput";
import UpsertEntryTypesSection from "./UpsertEntryTypesSection";

import ConfirmDialog from "@/app/components/ConfirmDialog";
import DbSourcesCheckboxes from "@/app/components/DbSourcesCheckboxes";
import AddTagsFormSection from "@/app/components/Form/AddTagsFormSection";
import FormFieldErrorMessages from "@/app/components/FormFieldErrorMessages";
import FormFieldNotifications from "@/app/components/FormFieldNotifications";
import GeneralizedDateFormInput from "@/app/components/GeneralizedDateFormInput";
import type { DbSource } from "@/db/db-source";
import { ALL_DB_SOURCES, dbSourceLabel } from "@/db/db-source-options";
import type {
  CreateMusicalEntry,
  CreateMusicalEntryInput,
  EntryByIdResult,
  UpdateMusicalEntry,
  UpdateMusicalEntryInput,
} from "@/types/entries";
import type { EntryTypeListItem } from "@/types/entryTypes";
import type { TagListItem } from "@/types/tags";
import { isDateInputFieldKey, omitProperty } from "@/utils/common";
import { updateImmutableSet } from "@/utils/immutableSet";

type UpsertEntryFormSharedProps = {
  primaryDbSource: DbSource;
  tags: TagListItem[];
  allEntryTypes: EntryTypeListItem[];
  restoredState?: UpsertEntryFormPersistedState | null;
  onPersistState: (state: UpsertEntryFormPersistedState) => void;
  onCancel: () => void;
  onEntrySaved: (
    entry: EntryByIdResult,
    notifications: string[],
    errors: string[],
  ) => void;
};

export type UpsertEntryFormUpdateProps = UpsertEntryFormSharedProps & {
  mode: "update";
  entry: UpsertEntryFormEntry;
  updateMusicalEntry: UpdateMusicalEntry;
};

export type UpsertEntryFormCreateProps = UpsertEntryFormSharedProps & {
  mode: "create";
  artistId: string;
  createMusicalEntry: CreateMusicalEntry;
};

export type UpsertEntryFormProps =
  | UpsertEntryFormUpdateProps
  | UpsertEntryFormCreateProps;

const MAIN_NAME_FIELD_ERROR_ID = "upsert-entry-main-name-error";
const ORIGINAL_RELEASE_DATE_FIELD_ERROR_ID =
  "upsert-entry-original-release-date-error";
const DISCOGS_URL_FIELD_ERROR_ID = "upsert-entry-discogs-url-error";
const DISCOGS_URL_FIELD_NOTIFICATIONS_ID =
  "upsert-entry-discogs-url-notifications";
const COMMENT_FIELD_NOTIFICATIONS_ID = "upsert-entry-comment-notifications";
const RELATION_TO_QUEEN_FIELD_NOTIFICATIONS_ID =
  "upsert-entry-relation-to-queen-notifications";

const UpsertEntryForm: FC<UpsertEntryFormProps> = (props) => {
  const {
    mode,
    primaryDbSource,
    onCancel,
    onEntrySaved,
    tags,
    allEntryTypes,
    restoredState,
    onPersistState,
  } = props;

  const isCreateMode = mode === "create";
  const entry = mode === "update" ? props.entry : undefined;
  const updateMusicalEntry =
    mode === "update" ? props.updateMusicalEntry : undefined;
  const createMusicalEntry =
    mode === "create" ? props.createMusicalEntry : undefined;
  const artistId = mode === "create" ? props.artistId : undefined;

  const [form, setForm] = useState<UpsertEntryFormDraft>(() => {
    if (restoredState?.form) {
      return restoredState.form;
    }

    return isCreateMode
      ? initialUpsertEntryFormDraftForCreate()
      : initialUpsertEntryFormDraftValue(props.entry);
  });

  const [showSubmissionValidationError, setShowSubmissionValidationError] =
    useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [checkedDbSources, setCheckedDbSources] = useState<
    ReadonlySet<DbSource>
  >(() => restoredState?.checkedDbSources ?? new Set(ALL_DB_SOURCES));
  const [submitError, setSubmitError] = useState<string>();

  useEffect(() => {
    return () => {
      onPersistState({ form, checkedDbSources });
    };
  }, [form, checkedDbSources, onPersistState]);

  // Reset when entry is updated while the form stays mounted (update mode only).
  // Skip on mount so a restored draft is not overwritten.
  const prevEntryRef = useRef(entry);

  useEffect(() => {
    if (isCreateMode || entry === undefined) {
      return;
    }

    if (prevEntryRef.current === entry) {
      return;
    }

    prevEntryRef.current = entry;
    setForm(initialUpsertEntryFormDraftValue(entry));
    setShowSubmissionValidationError(false);
    setIsConfirmOpen(false);
    setSubmitError(undefined);
  }, [entry, isCreateMode]);

  const setFieldValue = <K extends keyof UpsertEntryFormDraft>(
    key: K,
    value:
      | UpsertEntryFormDraft[K]["value"]
      | ((prev: UpsertEntryFormDraft) => UpsertEntryFormDraft[K]["value"]),
  ) =>
    setForm((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: typeof value === "function" ? value(prev) : value,
      },
    }));

  const setField = <K extends keyof UpsertEntryFormDraft>(
    key: K,
    value:
      | UpsertEntryFormDraft[K]
      | ((prev: UpsertEntryFormDraft) => UpsertEntryFormDraft[K]),
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: typeof value === "function" ? value(prev) : value,
    }));
  };

  // on focus we attempt to remove errors and notifications related to the field that is being focused
  const onFocus = (key: UpsertEntryFormInputFieldKey) => {
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

  const validateField = <K extends keyof UpsertEntryFormDraft>(key: K) => {
    const formFieldData = form[key];

    type ValueType = UpsertEntryFormDraft[K]["value"];
    type ResultType = ReturnType<UpsertEntryFormDraft[K]["validationFn"]>;

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
        ? initialUpsertEntryFormFieldErrors[key]
        : validationResult.errorMessages,
    }));

    return validationResult;
  };

  const onBlur = (key: keyof UpsertEntryFormDraft) => validateField(key);

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

    setIsSubmitting(true);
    setSubmitError(undefined);

    const savePromise =
      isCreateMode && createMusicalEntry !== undefined && artistId !== undefined
        ? createEntryAcrossDbSources(
            toCreateMusicalEntryInput({
              artistId,
              mainName,
              originalReleaseDate,
              discogsUrl,
              comment,
              selectedTags,
              selectedTypes,
              altNames,
              partOfQueenCollection,
              relationToQueen,
            }),
            checkedDbSources,
            primaryDbSource,
            createMusicalEntry,
          )
        : updateMusicalEntry !== undefined && entry !== undefined
          ? updateEntryAcrossDbSources(
              toUpdateMusicalEntryInput({
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
              }),
              checkedDbSources,
              primaryDbSource,
              updateMusicalEntry,
            )
          : Promise.reject(new Error("Entry form is missing save handlers"));

    savePromise
      .then(({ entry: savedEntry, outcomes }) => {
        const { notifications, errors } = isCreateMode
          ? buildCreateEntryFeedback(outcomes)
          : buildUpdateEntryFeedback(outcomes);

        setIsConfirmOpen(false);

        if (savedEntry) {
          if (isCreateMode) {
            setForm(initialUpsertEntryFormDraftForCreate());
          }

          onEntrySaved(savedEntry, notifications, errors);
        } else if (errors.length > 0) {
          setSubmitError(errors.join("\n"));
        }
      })
      .catch((error: unknown) => {
        console.error(
          isCreateMode
            ? "Failed to create musical entry"
            : "Failed to update musical entry",
          error,
        );
        setSubmitError(
          error instanceof Error
            ? error.message
            : isCreateMode
              ? "Failed to create musical entry"
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
    <div className="mt-4">
      <form
        className="box-border rounded-xl border border-black/20 bg-white px-5 py-4 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="mb-[0.65rem] flex flex-col gap-[0.35rem]">
          <label
            className="mb-3 text-base leading-snug font-semibold"
            htmlFor="upsert-entry-main-name"
          >
            Main name
            <sup
              className="ml-[0.25em] text-[1.1em] leading-none font-semibold"
              aria-hidden="true"
            >
              *
            </sup>
          </label>
          <input
            id="upsert-entry-main-name"
            className="px-2 py-[0.35rem] text-base"
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
          className="mt-7 mb-[0.9rem] border-0 border-t border-black/25"
          aria-hidden
        />

        <div className="mb-[0.65rem] flex flex-col gap-[0.35rem]">
          <h2 className="mb-3 text-base leading-snug font-semibold">
            Original release date
          </h2>
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
          className="mt-7 mb-[0.9rem] border-0 border-t border-black/25"
          aria-hidden
        />

        <div className="mb-[0.65rem] flex flex-col gap-[0.35rem]">
          <label
            className="mb-3 text-base leading-snug font-semibold"
            htmlFor="upsert-entry-discogs-url"
          >
            Discogs URL
          </label>
          <input
            id="upsert-entry-discogs-url"
            className="px-2 py-[0.35rem] text-base"
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
          className="mt-7 mb-[0.9rem] border-0 border-t border-black/25"
          aria-hidden
        />

        <AddTagsFormSection
          tags={tags}
          selectedTagIds={form.selectedTags.value}
          onAddTag={addSelectedTag}
          onRemoveTag={removeSelectedTag}
        />

        <hr
          className="my-[0.9rem] border-0 border-t border-black/25"
          aria-hidden
        />

        <UpsertEntryTypesSection
          allEntryTypes={allEntryTypes}
          selectedTypeIds={form.selectedTypes.value}
          onAddType={addSelectedType}
          onRemoveType={removeSelectedType}
        />

        <hr
          className="my-[0.9rem] border-0 border-t border-black/25"
          aria-hidden
        />

        <UpsertEntryAltNamesSection
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

        <hr
          className="my-[0.9rem] border-0 border-t border-black/25"
          aria-hidden
        />

        <div className="mt-[0.15rem] flex items-start gap-2">
          <input
            id="upsert-entry-part-of-queen-collection"
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
            className="m-0 leading-snug font-normal"
            htmlFor="upsert-entry-part-of-queen-collection"
          >
            Part of Queen collection
          </label>
        </div>

        {form.partOfQueenCollection.value && (
          <div className="mt-[0.85rem] mb-[0.65rem] flex flex-col gap-[0.35rem]">
            <label
              className="mb-3 text-base leading-snug font-semibold"
              htmlFor="upsert-entry-relation-to-queen"
            >
              Relation to Queen
            </label>
            <textarea
              id="upsert-entry-relation-to-queen"
              className="min-h-[4.5rem] resize-y px-2 py-[0.35rem] font-[inherit] text-base leading-snug"
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

        <hr
          className="my-[0.9rem] border-0 border-t border-black/25"
          aria-hidden
        />

        <div className="mb-[0.65rem] flex flex-col gap-[0.35rem]">
          <label
            className="mb-3 text-base leading-snug font-semibold"
            htmlFor="upsert-entry-comment"
          >
            Comment
          </label>
          <textarea
            id="upsert-entry-comment"
            className="min-h-[4.5rem] resize-y px-2 py-[0.35rem] font-[inherit] text-base leading-snug"
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

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="cursor-pointer rounded-md border border-[#bcbcbc] bg-white px-[0.9rem] py-[0.35rem] font-medium text-[#333] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a5fb4] hover:enabled:border-[#9a9a9a] hover:enabled:bg-[#f1f1f1]"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="cursor-pointer rounded-md border border-[#154f96] bg-[#1a5fb4] px-[0.9rem] py-[0.35rem] font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a5fb4] hover:enabled:bg-[#154f96] disabled:cursor-not-allowed disabled:border-[#bcbcbc] disabled:bg-[#d6d6d6] disabled:text-[#6b6b6b]"
            onMouseDown={(e) => e.preventDefault()}
          >
            {isCreateMode ? "Add entry" : "Save"}
          </button>
        </div>
        {showSubmissionValidationError && (
          <p
            className="mt-[0.6rem] mb-0 text-[0.9em] text-[#b42318]"
            role="alert"
          >
            Entry submission failed due to validation errors, check the form
            values
          </p>
        )}
      </form>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        size="wide"
        title={isCreateMode ? "Confirm new entry" : "Confirm entry changes"}
        description={
          isConfirmOpen && (
            <>
              <UpsertEntryFormPreview
                form={form}
                tags={tags}
                allEntryTypes={allEntryTypes}
              />
              <DbSourcesCheckboxes
                heading={
                  isCreateMode ? "Add to databases" : "Save to databases"
                }
                headingId={
                  isCreateMode
                    ? "create-entry-db-sources-heading"
                    : "update-entry-db-sources-heading"
                }
                idPrefix={
                  isCreateMode
                    ? "create-entry-db-source"
                    : "update-entry-db-source"
                }
                activeDbSource={primaryDbSource}
                checkedSources={checkedDbSources}
                onToggle={handleToggleDbSource}
              />
            </>
          )
        }
        confirmLabel={isCreateMode ? "Add entry" : "Save entry"}
        cancelLabel={isCreateMode ? "Back to form" : "Back to edit"}
        isBusy={isSubmitting}
        errorMessage={submitError}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelConfirm}
      />
    </div>
  );
};

export default UpsertEntryForm;

type SaveEntryOutcome =
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

type SaveEntryOutcomes = {
  entry: EntryByIdResult | undefined;
  outcomes: SaveEntryOutcome[];
};

const withSharedEntryId = (
  input: CreateMusicalEntryInput,
  sharedEntryId: string | undefined,
): CreateMusicalEntryInput => ({
  ...input,
  entry:
    sharedEntryId === undefined
      ? input.entry
      : { ...input.entry, entryId: sharedEntryId },
});

const createEntryAcrossDbSources = async (
  createInput: CreateMusicalEntryInput,
  targets: ReadonlySet<DbSource>,
  primaryDbSource: DbSource,
  createMusicalEntry: CreateMusicalEntry,
): Promise<SaveEntryOutcomes> => {
  const orderedTargets = [
    primaryDbSource,
    ...Array.from(targets).filter((source) => source !== primaryDbSource),
  ];

  const outcomes: SaveEntryOutcome[] = [];
  let savedEntry: EntryByIdResult | undefined;
  let sharedEntryId: string | undefined;

  for (const source of orderedTargets) {
    const input = withSharedEntryId(createInput, sharedEntryId);

    try {
      const result = await createMusicalEntry(input, source);
      savedEntry = savedEntry ?? result.entry;
      sharedEntryId ??= result.entry.entryId;

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

      if (savedEntry === undefined) {
        break;
      }
    }
  }

  return {
    entry: savedEntry,
    outcomes,
  };
};

type UpdateEntryOutcome = SaveEntryOutcome;

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
  updateMusicalEntry: UpdateMusicalEntry,
): Promise<SaveEntryOutcomes> => {
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
      const result = await updateMusicalEntry(input, source);
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

const formatSaveEntryError = (reason: unknown): string =>
  reason instanceof Error ? reason.message : "Failed to save musical entry";

const buildCreateEntryFeedback = (
  outcomes: SaveEntryOutcome[],
): { notifications: string[]; errors: string[] } => {
  const notifications: string[] = [];
  const errors: string[] = [];

  for (const outcome of outcomes) {
    if (outcome.status === "fulfilled") {
      notifications.push(...outcome.notifications);
    } else {
      const errorMessage = `Failed to create musical entry in ${dbSourceLabel(outcome.source)}`;
      console.error(errorMessage, outcome.reason);

      errors.push(`${errorMessage}: ${formatSaveEntryError(outcome.reason)}`);
    }
  }

  return { notifications, errors };
};

const formatUpdateEntryError = formatSaveEntryError;

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
