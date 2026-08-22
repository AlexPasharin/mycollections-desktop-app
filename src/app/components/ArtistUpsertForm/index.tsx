import { type FC, type FormEvent, useEffect, useState } from "react";

import ArtistUpsertFormPreview from "./ArtistUpsertFormPreview";
import {
  defaultAltNameRow,
  defaultRelatedParentRow,
  initialArtistUpsertFormDraft,
  type ArtistUpsertFormDraft,
} from "./artistUpsertFormUtils/formValues";
import { toUpsertArtistInput } from "./artistUpsertFormUtils/toUpsertArtistInput";
import ArtistUpsertRelatedArtistsSection from "./ArtistUpsertRelatedArtistsSection";

import FormSectionsDivider from "../Form/FormSectionsDivider";

import ConfirmDialog from "@/app/components/ConfirmDialog";
import DbSourcesCheckboxes from "@/app/components/DbSourcesCheckboxes";
import ErrorMessages from "@/app/components/ErrorMessages";
import FeedbackSection from "@/app/components/FeedbackSection";
import type { DbSource } from "@/db/db-source";
import { ALL_DB_SOURCES, dbSourceLabel } from "@/db/db-source-options";
import type {
  ArtistAltNameInput,
  ArtistByIdResult,
  CreateArtist,
  CreateArtistInput,
  UpdateArtist,
  UpdateArtistInput,
} from "@/types/artists";
import type { RelatedItemRelation } from "@/types/common";
import { ArtistType } from "@/types/db/database";
import type {
  FormFeedback,
  FeedbackErrors,
  FeedbackNotifications,
  FormField,
} from "@/types/form";
import { formatArtistTypeLabel } from "@/utils/artist";
import { omitProperty } from "@/utils/common";
import { updateImmutableSet } from "@/utils/immutableSet";

type ArtistUpsertFormSharedProps = {
  primaryDbSource: DbSource;
  onClearFeedback: () => void;
  onArtistSaved: (result: {
    artist: ArtistByIdResult;
    feedback: FormFeedback;
  }) => void;
};

type ArtistUpsertFormUpdateProps = ArtistUpsertFormSharedProps & {
  mode: "update";
  artist: ArtistByIdResult;
  updateArtist: UpdateArtist;
};

type ArtistUpsertFormCreateProps = ArtistUpsertFormSharedProps & {
  mode: "create";
  artist?: never;
  createArtist: CreateArtist;
};

export type ArtistUpsertFormProps =
  | ArtistUpsertFormUpdateProps
  | ArtistUpsertFormCreateProps;

const NAME_FIELD_ERROR_ID = "upsert-artist-name-error";
const NAME_FIELD_NOTIFICATIONS_ID = "upsert-artist-name-notifications";

const NAME_FOR_SORTING_FIELD_ERROR_ID = "upsert-artist-name-for-sorting-error";
const NAME_FOR_SORTING_FIELD_NOTIFICATIONS_ID =
  "upsert-artist-name-for-sorting-notifications";

type ArtistUpsertFormArrayErrorField = Exclude<
  keyof ArtistUpsertFormDraft,
  "relatedParents"
>;

const ArtistUpsertForm: FC<ArtistUpsertFormProps> = (props) => {
  const { mode, primaryDbSource, onClearFeedback, onArtistSaved, artist } =
    props;
  const isCreateMode = mode === "create";

  const [form, setForm] = useState<ArtistUpsertFormDraft>(() =>
    initialArtistUpsertFormDraft(artist),
  );
  const [showSubmissionValidationError, setShowSubmissionValidationError] =
    useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [checkedDbSources, setCheckedDbSources] = useState<
    ReadonlySet<DbSource>
  >(() => new Set(ALL_DB_SOURCES));

  useEffect(() => {
    setForm(initialArtistUpsertFormDraft(artist));
    setShowSubmissionValidationError(false);
    setIsConfirmOpen(false);
    setSubmitError(undefined);
  }, [artist, isCreateMode]);

  const setFieldValue = <K extends keyof ArtistUpsertFormDraft>(
    key: K,
    value:
      | ArtistUpsertFormDraft[K]["value"]
      | ((prev: ArtistUpsertFormDraft) => ArtistUpsertFormDraft[K]["value"]),
  ) =>
    setForm((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: typeof value === "function" ? value(prev) : value,
      },
    }));

  const setField = <K extends keyof ArtistUpsertFormDraft>(
    key: K,
    value:
      | ArtistUpsertFormDraft[K]
      | ((prev: ArtistUpsertFormDraft) => ArtistUpsertFormDraft[K]),
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: typeof value === "function" ? value(prev) : value,
    }));
  };

  const clearFieldFeedback = (
    key: ArtistUpsertFormArrayErrorField,
    source?: PropertyKey,
  ) => {
    setField(key, (prev) => ({
      ...prev[key],
      errors: prev[key].errors.filter(
        (error) =>
          error.sources && (!source || !error.sources.includes(source)),
      ),
      notifications: [],
    }));
  };

  const validateField = <T extends keyof ArtistUpsertFormDraft>(key: T) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const validationResult = form[key].validationFn(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      form[key].value as never,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      form as Record<string, FormField<unknown, unknown, unknown, unknown>>,
    ) as ReturnType<ArtistUpsertFormDraft[T]["validationFn"]>;

    setField(key, (prev) => ({
      ...prev[key],
      valid: validationResult.valid,
      value: validationResult.value,
      notifications: validationResult.notifications ?? [],
      errors: validationResult.valid ? [] : validationResult.errorMessages,
    }));

    return validationResult;
  };

  const onBlur = (key: keyof ArtistUpsertFormDraft) => validateField(key);

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
      errors: prev.altNames.errors.filter(
        (error) => !error.sources?.includes(rowId),
      ),
    }));
  };

  const setAltNameValue = (rowId: string, name: string) => {
    setFieldValue("altNames", (prev) =>
      prev.altNames.value.map((row) =>
        row.id === rowId ? { ...row, name } : row,
      ),
    );
  };

  const addRelatedParentRow = () => {
    setFieldValue("relatedParents", (prev) => [
      ...prev.relatedParents.value,
      defaultRelatedParentRow(),
    ]);
  };

  const removeRelatedParentRow = (rowId: string) => {
    setField("relatedParents", (prev) => ({
      ...prev.relatedParents,
      value: prev.relatedParents.value.filter((row) => row.id !== rowId),
      errors: omitProperty(prev.relatedParents.errors, rowId),
    }));
  };

  const setRelatedParentArtistId = (rowId: string, artistId: string) => {
    setFieldValue("relatedParents", (prev) =>
      prev.relatedParents.value.map((row) =>
        row.id === rowId ? { ...row, artistId } : row,
      ),
    );
  };

  const setRelatedParentRelation = (
    rowId: string,
    relation: RelatedItemRelation | "",
  ) => {
    setFieldValue("relatedParents", (prev) =>
      prev.relatedParents.value.map((row) =>
        row.id === rowId ? { ...row, relation } : row,
      ),
    );
  };

  const clearRelatedParentRowFeedback = (rowId: string) => {
    setField("relatedParents", (prev) => ({
      ...prev.relatedParents,
      errors: omitProperty(prev.relatedParents.errors, rowId),
      notifications: [],
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validationResults = {
      name: validateField("name"),
      nameForSorting: validateField("nameForSorting"),
      type: validateField("type"),
      partOfQueenFamily: validateField("partOfQueenFamily"),
      altNames: validateField("altNames"),
      relatedParents: validateField("relatedParents"),
    };

    const formIsValid = Object.values(validationResults).every(
      (result) => result.valid,
    );

    setShowSubmissionValidationError(!formIsValid);

    if (formIsValid) {
      onClearFeedback();
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
      name: { value: name },
      nameForSorting: { value: nameForSorting },
      type: { value: typeValue },
      partOfQueenFamily: { value: partOfQueenFamily },
      altNames: { value: altNames },
      relatedParents: { value: relatedArtists },
    } = form;

    setIsSubmitting(true);
    setSubmitError(undefined);

    const upsertInput = toUpsertArtistInput({
      name,
      nameForSorting,
      type: typeValue,
      partOfQueenFamily,
      altNames,
      relatedArtists,
    });

    const savePromise = isCreateMode
      ? createArtistAcrossDbSources(
          upsertInput,
          checkedDbSources,
          primaryDbSource,
          props.createArtist,
        )
      : updateArtistAcrossDbSources(
          { ...upsertInput, artistId: artist.artistId },
          checkedDbSources,
          primaryDbSource,
          props.updateArtist,
        );

    savePromise
      .then(({ artist: savedArtist, outcomes }) => {
        const { notifications, errors } = buildUpsertArtistFeedback(
          outcomes,
          mode,
        );

        if (savedArtist) {
          setIsConfirmOpen(false);

          onArtistSaved({
            artist: savedArtist,
            feedback: { notifications, errors },
          });

          return;
        }

        const errorMessages =
          errors.length > 0
            ? errors.map((error) => error.message).join("\n")
            : `Failed to ${mode} artist in one or more databases`;

        setSubmitError(errorMessages);
      })
      .catch((error: unknown) => {
        console.error(
          `Error ${mode === "create" ? "creating" : "updating"} artist`,
          error,
        );
        setSubmitError(formatUpsertArtistError(error, mode));
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleCancelConfirm = () => {
    if (isSubmitting) {
      return;
    }

    setIsConfirmOpen(false);
    setSubmitError(undefined);
  };

  const nameErrors = form.name.errors;
  const nameNotifications = form.name.notifications;

  const nameForSortingErrors = form.nameForSorting.errors;
  const nameForSortingNotifications = form.nameForSorting.notifications;

  const altNameRows = form.altNames.value;
  const altNameErrors = form.altNames.errors;
  const hasNameErrors = nameErrors.length > 0;

  return (
    <div>
      <form
        className="box-border rounded-xl border border-black/20 bg-white px-5 py-4 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="upsert-artist-name" className="font-medium">
            Name
          </label>
          <input
            id="upsert-artist-name"
            type="text"
            value={form.name.value}
            onChange={(event) => {
              setFieldValue("name", event.target.value);
              clearFieldFeedback("name");
              setSubmitError(undefined);
            }}
            onBlur={() => {
              onBlur("name");
            }}
            disabled={isSubmitting}
            aria-invalid={hasNameErrors}
            aria-describedby={hasNameErrors ? NAME_FIELD_ERROR_ID : undefined}
            className="px-2 py-[0.35rem] text-base"
            autoComplete="off"
          />
          <FeedbackSection
            notificationsId={NAME_FIELD_NOTIFICATIONS_ID}
            errorsId={NAME_FIELD_ERROR_ID}
            errors={nameErrors}
            notifications={nameNotifications}
          />
        </div>

        <FormSectionsDivider />

        <div className="flex flex-col gap-1">
          <label
            htmlFor="upsert-artist-name-for-sorting"
            className="font-medium"
          >
            Different name used for sorting (if needed)
          </label>
          <input
            id="upsert-artist-name-for-sorting"
            type="text"
            value={form.nameForSorting.value}
            onChange={(event) => {
              setFieldValue("nameForSorting", event.target.value);
              clearFieldFeedback("nameForSorting");
              setSubmitError(undefined);
            }}
            onBlur={() => {
              onBlur("nameForSorting");
            }}
            disabled={isSubmitting}
            className="px-2 py-[0.35rem] text-base"
            autoComplete="off"
          />
          <FeedbackSection
            notificationsId={NAME_FOR_SORTING_FIELD_NOTIFICATIONS_ID}
            errorsId={NAME_FOR_SORTING_FIELD_ERROR_ID}
            errors={nameForSortingErrors}
            notifications={nameForSortingNotifications}
          />
        </div>

        <FormSectionsDivider />

        <div className="flex flex-col gap-1">
          <label htmlFor="upsert-artist-type" className="font-medium">
            Type
          </label>
          <select
            id="upsert-artist-type"
            value={form.type.value}
            onChange={(event) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
              setFieldValue("type", event.target.value as ArtistType);
              clearFieldFeedback("type");
              setSubmitError(undefined);
            }}
            disabled={isSubmitting}
            className="box-border w-full max-w-96 px-2 py-[0.35rem] text-base"
          >
            {ARTIST_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <FormSectionsDivider />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.partOfQueenFamily.value}
            onChange={(event) => {
              setFieldValue("partOfQueenFamily", event.target.checked);
              clearFieldFeedback("partOfQueenFamily");
              setSubmitError(undefined);
            }}
            disabled={isSubmitting}
          />
          <span>Part of Queen family</span>
        </label>

        <FormSectionsDivider />

        <div>
          <h2 className="mb-3 text-base leading-snug font-semibold">
            Alternative names
          </h2>

          {altNameRows.length > 0 && (
            <ul
              className="mb-3 flex flex-col gap-[0.55rem] p-0"
              aria-label="Alternative names"
            >
              {altNameRows.map((row, index) => {
                const rowErrors = altNameErrors.filter((error) =>
                  error.sources?.includes(row.id),
                );
                const hasErrors = rowErrors.length > 0;
                const errorId = `upsert-artist-alt-name-error-${row.id}`;
                const inputId = `upsert-artist-alt-name-${row.id}`;

                return (
                  <li key={row.id} className="flex flex-wrap items-start gap-2">
                    <label
                      className="min-w-28 pt-[0.35rem] text-[0.92em] font-semibold"
                      htmlFor={inputId}
                    >
                      Alt name {index + 1}
                    </label>
                    <input
                      id={inputId}
                      className="min-w-40 flex-[1_1_14rem] px-2 py-[0.35rem] text-base"
                      type="text"
                      value={row.name}
                      onChange={(event) => {
                        setAltNameValue(row.id, event.target.value);
                        clearFieldFeedback("altNames", row.id);
                      }}
                      onBlur={() => {
                        onBlur("altNames");
                      }}
                      disabled={isSubmitting}
                      aria-invalid={hasErrors}
                      aria-describedby={hasErrors ? errorId : undefined}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      className="cursor-pointer rounded-md border border-[#bcbcbc] bg-white px-[0.6rem] py-[0.35rem] text-[0.92em] text-[#333] hover:bg-[#f1f1f1] disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => {
                        removeAltNameRow(row.id);
                      }}
                      disabled={isSubmitting}
                    >
                      Remove
                    </button>
                    <ErrorMessages id={errorId} messages={rowErrors} />
                  </li>
                );
              })}
            </ul>
          )}

          <button
            type="button"
            className="inline-block cursor-pointer border-none bg-transparent px-0 py-1 text-[0.92em] text-[#1a5fb4] underline hover:text-[#0d3d82] disabled:cursor-not-allowed disabled:opacity-60"
            onClick={addAltNameRow}
            disabled={isSubmitting}
          >
            Add alternative name
          </button>
        </div>

        <FormSectionsDivider />

        <ArtistUpsertRelatedArtistsSection
          relatedArtists={form.relatedParents.value}
          errors={form.relatedParents.errors}
          notifications={form.relatedParents.notifications}
          onChangeArtistId={(rowId, artistId) => {
            setRelatedParentArtistId(rowId, artistId);
            clearRelatedParentRowFeedback(rowId);
          }}
          onChangeRelation={(rowId, relation) => {
            setRelatedParentRelation(rowId, relation);
            clearRelatedParentRowFeedback(rowId);
          }}
          onAddRow={addRelatedParentRow}
          onRemoveRow={removeRelatedParentRow}
          onFocus={(rowId) => {
            setShowSubmissionValidationError(false);
            clearRelatedParentRowFeedback(rowId);
          }}
          onBlur={() => {
            onBlur("relatedParents");
          }}
        />

        {showSubmissionValidationError && (
          <p className="m-0 text-[0.85em] text-[#b42318]" role="alert">
            Artist submission failed due to validation errors, check the form
            values
          </p>
        )}

        <div>
          <button
            type="submit"
            className="cursor-pointer rounded-md border border-indigo-600 bg-indigo-600 px-[0.95rem] py-[0.45rem] font-[inherit] text-[0.9rem] font-medium text-white transition-[background,border-color] duration-150 ease-in-out hover:enabled:border-indigo-700 hover:enabled:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isCreateMode ? "Create artist" : "Save changes"}
          </button>
        </div>
      </form>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        size="wide"
        title={isCreateMode ? "Confirm new artist" : "Confirm artist changes"}
        description={
          isConfirmOpen && (
            <>
              <ArtistUpsertFormPreview form={form} />
              <DbSourcesCheckboxes
                heading={
                  isCreateMode ? "Add to databases" : "Save to databases"
                }
                headingId={
                  isCreateMode
                    ? "create-artist-db-sources-heading"
                    : "update-artist-db-sources-heading"
                }
                idPrefix={
                  isCreateMode
                    ? "create-artist-db-source"
                    : "update-artist-db-source"
                }
                activeDbSource={primaryDbSource}
                checkedSources={checkedDbSources}
                onToggle={handleToggleDbSource}
              />
            </>
          )
        }
        confirmLabel={isCreateMode ? "Create artist" : "Save artist"}
        cancelLabel={isCreateMode ? "Back to form" : "Back to edit"}
        isBusy={isSubmitting}
        errorMessage={submitError}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelConfirm}
      />
    </div>
  );
};

export default ArtistUpsertForm;

type UpsertArtistOutcome =
  | {
      source: DbSource;
      status: "fulfilled";
      artist: ArtistByIdResult;
      notifications: string[];
    }
  | {
      source: DbSource;
      status: "rejected";
      reason: unknown;
    };

type AltName = string;
type AltNameId = string;
type AltNameIdMap = Map<AltName, AltNameId>;

const buildArtistAltNameIdsMap = (
  inputAltNames: ArtistAltNameInput[],
  updatedAltNames: ArtistByIdResult["altNames"],
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

const applySharedAltNameIds = (
  altNames: ArtistAltNameInput[],
  sharedAltNameIds: AltNameIdMap | undefined,
): ArtistAltNameInput[] =>
  altNames.map((altName) => {
    if (altName.nameId !== undefined) {
      return altName;
    }

    const nameId = sharedAltNameIds?.get(altName.name.trim());

    return nameId === undefined ? altName : { ...altName, nameId };
  });

const withSharedAltNameIds = (
  input: UpdateArtistInput,
  sharedAltNameIds: AltNameIdMap | undefined,
): UpdateArtistInput => ({
  ...input,
  altNames: applySharedAltNameIds(input.altNames, sharedAltNameIds),
});

const withSharedArtistId = (
  input: CreateArtistInput,
  sharedArtistId: string | undefined,
): CreateArtistInput => ({
  ...input,
  artist:
    sharedArtistId === undefined
      ? input.artist
      : { ...input.artist, artistId: sharedArtistId },
});

const withSharedCreateInput = (
  createInput: CreateArtistInput,
  sharedArtistId: string | undefined,
  sharedAltNameIds: AltNameIdMap | undefined,
): CreateArtistInput =>
  withSharedArtistId(
    {
      ...createInput,
      altNames: applySharedAltNameIds(createInput.altNames, sharedAltNameIds),
    },
    sharedArtistId,
  );

const createArtistAcrossDbSources = async (
  createInput: CreateArtistInput,
  targets: ReadonlySet<DbSource>,
  primaryDbSource: DbSource,
  createArtist: CreateArtist,
): Promise<{
  artist: ArtistByIdResult | undefined;
  outcomes: UpsertArtistOutcome[];
}> => {
  const orderedTargets = [
    primaryDbSource,
    ...Array.from(targets).filter((source) => source !== primaryDbSource),
  ];

  const outcomes: UpsertArtistOutcome[] = [];
  let createdArtist: ArtistByIdResult | undefined;
  let sharedArtistId: string | undefined;
  let sharedAltNameIds: AltNameIdMap | undefined;

  for (const source of orderedTargets) {
    const input = withSharedCreateInput(
      createInput,
      sharedArtistId,
      sharedAltNameIds,
    );

    try {
      const result = await createArtist(input, source);
      createdArtist = createdArtist ?? result.artist;
      sharedArtistId ??= result.artist.artistId;
      sharedAltNameIds ??= buildArtistAltNameIdsMap(
        createInput.altNames,
        result.artist.altNames,
      );

      outcomes.push({
        source,
        status: "fulfilled",
        artist: result.artist,
        notifications: result.notifications,
      });
    } catch (reason: unknown) {
      outcomes.push({
        source,
        status: "rejected",
        reason,
      });

      if (createdArtist === undefined) {
        break;
      }
    }
  }

  return {
    artist: createdArtist,
    outcomes,
  };
};

const updateArtistAcrossDbSources = async (
  updateInput: UpdateArtistInput,
  targets: ReadonlySet<DbSource>,
  primaryDbSource: DbSource,
  updateArtist: UpdateArtist,
): Promise<{
  artist: ArtistByIdResult | undefined;
  outcomes: UpsertArtistOutcome[];
}> => {
  const orderedTargets = [
    primaryDbSource,
    ...Array.from(targets).filter((source) => source !== primaryDbSource),
  ];

  const outcomes: UpsertArtistOutcome[] = [];
  let updatedArtist: ArtistByIdResult | undefined;
  let sharedAltNameIds: AltNameIdMap | undefined;

  for (const source of orderedTargets) {
    const input = withSharedAltNameIds(updateInput, sharedAltNameIds);

    try {
      const result = await updateArtist(input, source);
      updatedArtist = updatedArtist ?? result.artist;

      sharedAltNameIds ??= buildArtistAltNameIdsMap(
        updateInput.altNames,
        result.artist.altNames,
      );

      outcomes.push({
        source,
        status: "fulfilled",
        artist: result.artist,
        notifications: result.notifications,
      });
    } catch (reason: unknown) {
      outcomes.push({
        source,
        status: "rejected",
        reason,
      });

      if (updatedArtist === undefined) {
        break;
      }
    }
  }

  return {
    artist: updatedArtist,
    outcomes,
  };
};

const buildUpsertArtistFeedback = (
  outcomes: UpsertArtistOutcome[],
  mode: "create" | "update",
): FormFeedback => {
  const notifications: FeedbackNotifications = [];
  const errors: FeedbackErrors = [];

  for (const outcome of outcomes) {
    if (outcome.status === "fulfilled") {
      notifications.push(
        ...outcome.notifications.map((notification) => ({ notification })),
      );
    } else {
      const errorMessage = `Failed to ${mode} artist in ${dbSourceLabel(outcome.source)}`;
      console.error(errorMessage, outcome.reason);

      errors.push({
        message: `${errorMessage}: ${formatUpsertArtistError(outcome.reason, mode)}`,
      });
    }
  }

  return { notifications, errors };
};

const formatUpsertArtistError = (
  reason: unknown,
  mode: "create" | "update",
): string =>
  reason instanceof Error ? reason.message : `Failed to ${mode} artist`;

const ARTIST_TYPE_VALUES = Object.values(ArtistType);

const ARTIST_TYPE_OPTIONS = ARTIST_TYPE_VALUES.map((value) => ({
  value,
  label: formatArtistTypeLabel(value),
}));
