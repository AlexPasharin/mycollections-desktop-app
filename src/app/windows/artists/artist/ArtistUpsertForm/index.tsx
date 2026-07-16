import { type FC, type FormEvent, useEffect, useState } from "react";

import ArtistUpsertFormPreview from "./ArtistUpsertFormPreview";
import {
  defaultAltNameRow,
  initialArtistUpsertFormDraft,
  type ArtistUpsertFormDraft,
} from "./artistUpsertFormUtils/formValues";
import { toUpsertArtistInput } from "./artistUpsertFormUtils/toUpsertArtistInput";

import api from "../api";

import ConfirmDialog from "@/app/components/ConfirmDialog";
import DbSourcesCheckboxes from "@/app/components/DbSourcesCheckboxes";
import ErrorMessages from "@/app/components/ErrorMessages";
import FeedbackSection from "@/app/components/FeedbackSection";
import type { DbSource } from "@/db/db-source";
import { ALL_DB_SOURCES, dbSourceLabel } from "@/db/db-source-options";
import type {
  ArtistAltNameInput,
  ArtistByIdResult,
  UpdateArtistInput,
} from "@/types/artists";
import { ArtistType } from "@/types/db/database";
import type {
  FormFeedback,
  FeedbackErrors,
  FeedbackNotifications,
  FormField,
} from "@/types/form";
import { formatArtistTypeLabel } from "@/utils/artist";
import { updateImmutableSet } from "@/utils/immutableSet";

type ArtistUpsertFormProps = {
  artist: ArtistByIdResult;
  primaryDbSource: DbSource;
  onClearFeedback: () => void;
  onArtistUpdated: (result: {
    artist: ArtistByIdResult;
    feedback: FormFeedback;
  }) => void;
};

const NAME_FIELD_ERROR_ID = "update-artist-name-error";
const NAME_FIELD_NOTIFICATIONS_ID = "update-artist-name-notifications";

const NAME_FOR_SORTING_FIELD_ERROR_ID = "update-artist-name-for-sorting-error";
const NAME_FOR_SORTING_FIELD_NOTIFICATIONS_ID =
  "update-artist-name-for-sorting-notifications";

const ArtistUpsertForm: FC<ArtistUpsertFormProps> = ({
  artist,
  primaryDbSource,
  onClearFeedback,
  onArtistUpdated,
}) => {
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
  }, [artist]);

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
    key: keyof ArtistUpsertFormDraft,
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
    } = form;

    setIsSubmitting(true);
    setSubmitError(undefined);

    const upsertInput = toUpsertArtistInput({
      name,
      nameForSorting,
      type: typeValue,
      partOfQueenFamily,
      altNames,
    });

    updateArtistAcrossDbSources(
      { ...upsertInput, artistId: artist.artistId },
      checkedDbSources,
      primaryDbSource,
    )
      .then(({ artist: savedArtist, outcomes }) => {
        const { notifications, errors } = buildUpdateArtistFeedback(outcomes);

        if (savedArtist) {
          setIsConfirmOpen(false);

          onArtistUpdated({
            artist: savedArtist,
            feedback: { notifications, errors },
          });

          return;
        }

        const errorMessages =
          errors.length > 0
            ? errors.map((error) => error.message).join("\n")
            : "Failed to update artist in one or more databases";

        setSubmitError(errorMessages);
      })
      .catch((error: unknown) => {
        console.error("Error updating artist", error);
        setSubmitError(formatUpdateArtistError(error));
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
      <form className="flex max-w-2xl flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <label htmlFor="update-artist-name" className="font-medium">
            Name
          </label>
          <input
            id="update-artist-name"
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

        <div className="flex flex-col gap-1">
          <label
            htmlFor="update-artist-name-for-sorting"
            className="font-medium"
          >
            Different name used for sorting (if needed)
          </label>
          <input
            id="update-artist-name-for-sorting"
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

        <div className="flex flex-col gap-1">
          <label htmlFor="update-artist-type" className="font-medium">
            Type
          </label>
          <select
            id="update-artist-type"
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

        <div>
          <h2 className="mb-3 text-base leading-snug font-semibold">
            Alternative names
          </h2>

          {altNameRows.length > 0 && (
            <ul
              className="mb-3 flex flex-col gap-[0.55rem]"
              aria-label="Alternative names"
            >
              {altNameRows.map((row, index) => {
                const rowErrors = altNameErrors.filter((error) =>
                  error.sources?.includes(row.id),
                );
                const hasErrors = rowErrors.length > 0;
                const errorId = `update-artist-alt-name-error-${row.id}`;
                const inputId = `update-artist-alt-name-${row.id}`;

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
            Save changes
          </button>
        </div>
      </form>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        size="wide"
        title="Confirm artist changes"
        description={
          isConfirmOpen && (
            <>
              <ArtistUpsertFormPreview form={form} />
              <DbSourcesCheckboxes
                heading="Save to databases"
                headingId="update-artist-db-sources-heading"
                idPrefix="update-artist-db-source"
                activeDbSource={primaryDbSource}
                checkedSources={checkedDbSources}
                onToggle={handleToggleDbSource}
              />
            </>
          )
        }
        confirmLabel="Save artist"
        cancelLabel="Back to edit"
        isBusy={isSubmitting}
        errorMessage={submitError}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelConfirm}
      />
    </div>
  );
};

export default ArtistUpsertForm;

type UpdateArtistOutcome =
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

const updateArtistAcrossDbSources = async (
  updateInput: UpdateArtistInput,
  targets: ReadonlySet<DbSource>,
  primaryDbSource: DbSource,
): Promise<{
  artist: ArtistByIdResult | undefined;
  outcomes: UpdateArtistOutcome[];
}> => {
  const orderedTargets = [
    primaryDbSource,
    ...Array.from(targets).filter((source) => source !== primaryDbSource),
  ];

  const outcomes: UpdateArtistOutcome[] = [];
  let updatedArtist: ArtistByIdResult | undefined;
  let sharedAltNameIds: AltNameIdMap | undefined;

  for (const source of orderedTargets) {
    const input = withSharedAltNameIds(updateInput, sharedAltNameIds);

    try {
      const result = await api.updateArtist(input, source);
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

const buildUpdateArtistFeedback = (
  outcomes: UpdateArtistOutcome[],
): FormFeedback => {
  const notifications: FeedbackNotifications = [];
  const errors: FeedbackErrors = [];

  for (const outcome of outcomes) {
    if (outcome.status === "fulfilled") {
      notifications.push(
        ...outcome.notifications.map((notification) => ({ notification })),
      );
    } else {
      const errorMessage = `Failed to update artist in ${dbSourceLabel(outcome.source)}`;
      console.error(errorMessage, outcome.reason);

      errors.push({
        message: `${errorMessage}: ${formatUpdateArtistError(outcome.reason)}`,
      });
    }
  }

  return { notifications, errors };
};

const formatUpdateArtistError = (reason: unknown): string =>
  reason instanceof Error ? reason.message : "Failed to update artist";

const ARTIST_TYPE_VALUES = Object.values(ArtistType);

const ARTIST_TYPE_OPTIONS = ARTIST_TYPE_VALUES.map((value) => ({
  value,
  label: formatArtistTypeLabel(value),
}));
