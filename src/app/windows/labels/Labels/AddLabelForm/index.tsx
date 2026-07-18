import { type FC, type FormEvent, useState } from "react";

import api from "../../api";

import DbSourcesCheckboxes from "@/app/components/DbSourcesCheckboxes";
import type { DbSource } from "@/db/db-source";
import { ALL_DB_SOURCES, dbSourceLabel } from "@/db/db-source-options";
import type {
  FeedbackErrors,
  FeedbackNotifications,
  FormFeedback,
} from "@/types/form";
import type { CreateLabelInput, LabelListItem } from "@/types/labels";
import { updateImmutableSet } from "@/utils/immutableSet";

type AddLabelFormProps = {
  primaryDbSource: DbSource;
  labels: LabelListItem[];
  onClearAddLabelFeedback: () => void;
  onCreateLabel: (result: {
    label?: LabelListItem;
    feedback: FormFeedback;
  }) => void;
};

const AddLabelForm: FC<AddLabelFormProps> = ({
  primaryDbSource,
  labels,
  onClearAddLabelFeedback,
  onCreateLabel,
}) => {
  const [labelName, setLabelName] = useState("");
  const [checkedDbSources, setCheckedDbSources] = useState<
    ReadonlySet<DbSource>
  >(() => new Set(ALL_DB_SOURCES));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  const trimmedLabelName = labelName.trim();

  const handleToggleDbSource = (source: DbSource) => {
    setCheckedDbSources((prev) =>
      updateImmutableSet(source, prev.has(source) ? "remove" : "add")(prev),
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validationError = validateLabelName(trimmedLabelName, labels);

    if (validationError !== undefined) {
      setSubmitError(validationError);

      return;
    }

    onClearAddLabelFeedback();
    setSubmitError(undefined);
    setIsSubmitting(true);

    createLabelAcrossDbSources(
      trimmedLabelName,
      checkedDbSources,
      primaryDbSource,
    )
      .then(onCreateLabel)
      .catch((error: unknown) => {
        console.error("Error creating label", error);
        setSubmitError(formatCreateLabelError(error));
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <>
      <h2 className="mt-0">Add label</h2>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <label htmlFor="new-label-name" className="font-medium">
            Label name
          </label>
          <input
            id="new-label-name"
            type="text"
            value={labelName}
            onChange={(event) => {
              setLabelName(event.target.value);
              setSubmitError(undefined);
            }}
            disabled={isSubmitting}
            aria-invalid={submitError !== undefined}
            aria-describedby={submitError ? "new-label-name-error" : undefined}
            className="max-w-md rounded border border-gray-300 px-2 py-1"
          />
          {submitError && (
            <p
              id="new-label-name-error"
              className="m-0 text-[0.85em] text-[#b42318]"
              role="alert"
            >
              {submitError}
            </p>
          )}
        </div>

        <DbSourcesCheckboxes
          heading="Add to databases"
          headingId="add-label-db-sources-heading"
          idPrefix="add-label-db-source"
          activeDbSource={primaryDbSource}
          checkedSources={checkedDbSources}
          onToggle={handleToggleDbSource}
        />

        <div>
          <button
            type="submit"
            className="cursor-pointer rounded-md border border-indigo-600 bg-indigo-600 px-[0.95rem] py-[0.45rem] font-[inherit] text-[0.9rem] font-medium text-white transition-[background,border-color] duration-150 ease-in-out hover:enabled:border-indigo-700 hover:enabled:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Adding\u2026" : "Add label"}
          </button>
        </div>
      </form>
    </>
  );
};

export default AddLabelForm;

const validateLabelName = (
  trimmedLabelName: string,
  labels: LabelListItem[],
): string | undefined => {
  if (trimmedLabelName.length === 0) {
    return "Label name is required";
  }

  if (labels.some(({ name }) => name.trim() === trimmedLabelName)) {
    return "A label with this name already exists";
  }

  return undefined;
};

type CreateLabelOutcome =
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

const withLabelId = (
  name: string,
  labelId: string | undefined,
): CreateLabelInput => ({
  name,
  ...(labelId === undefined ? {} : { labelId }),
});

const createLabelAcrossDbSources = async (
  name: string,
  targets: ReadonlySet<DbSource>,
  primaryDbSource: DbSource,
): Promise<{
  label?: LabelListItem;
  feedback: FormFeedback;
}> => {
  const orderedTargets = [
    primaryDbSource,
    ...Array.from(targets).filter((source) => source !== primaryDbSource),
  ];

  const outcomes: CreateLabelOutcome[] = [];
  let sharedLabelId: string | undefined;

  for (const source of orderedTargets) {
    try {
      const result = await api.createLabel(
        withLabelId(name, sharedLabelId),
        source,
      );
      sharedLabelId ??= result.label.labelId;

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

      if (sharedLabelId === undefined) {
        break;
      }
    }
  }

  return {
    ...(sharedLabelId === undefined
      ? {}
      : { label: { labelId: sharedLabelId, name } }),
    feedback: buildCreateLabelFeedback(outcomes),
  };
};

const formatCreateLabelError = (reason: unknown): string =>
  reason instanceof Error ? reason.message : "Failed to create label";

const buildCreateLabelFeedback = (
  outcomes: CreateLabelOutcome[],
): FormFeedback => {
  const notifications: FeedbackNotifications = [];
  const errors: FeedbackErrors = [];

  for (const outcome of outcomes) {
    if (outcome.status === "fulfilled") {
      notifications.push(
        ...outcome.notifications.map((notification) => ({ notification })),
      );
    } else {
      const errorMessage = `Failed to create label in ${dbSourceLabel(outcome.source)}`;
      console.error(errorMessage, outcome.reason);

      errors.push({
        message: `${errorMessage}: ${formatCreateLabelError(outcome.reason)}`,
      });
    }
  }

  return { notifications, errors };
};
