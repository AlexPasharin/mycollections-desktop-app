import { type FC, type FormEvent, useState } from "react";

import api from "../../api";

import DbSourcesCheckboxes from "@/app/components/DbSourcesCheckboxes";
import type { DbSource } from "@/db/db-source";
import { ALL_DB_SOURCES, dbSourceLabel } from "@/db/db-source-options";
import type { CreateTagInput, TagListItem } from "@/types/tags";
import { updateImmutableSet } from "@/utils/immutableSet";

type AddTagFormProps = {
  primaryDbSource: DbSource;
  tags: TagListItem[];
  onClearAddTagFeedback: () => void;
  onCreateTag: (result: {
    tagId: string | undefined;
    notifications: string[];
    errors: string[];
  }) => void;
};

const AddTagForm: FC<AddTagFormProps> = ({
  primaryDbSource,
  tags,
  onClearAddTagFeedback,
  onCreateTag,
}) => {
  const [tagName, setTagName] = useState("");
  const [checkedDbSources, setCheckedDbSources] = useState<
    ReadonlySet<DbSource>
  >(() => new Set(ALL_DB_SOURCES));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  const trimmedTagName = tagName.trim();

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

    const validationError = validateTagName(trimmedTagName, tags);

    if (validationError !== undefined) {
      setSubmitError(validationError);

      return;
    }

    onClearAddTagFeedback();
    setSubmitError(undefined);
    setIsSubmitting(true);

    createTagAcrossDbSources(trimmedTagName, checkedDbSources, primaryDbSource)
      .then(onCreateTag)
      .catch((error: unknown) => {
        console.error("Error creating tag", error);
        setSubmitError(formatCreateTagError(error));
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <>
      <h2 className="mt-0">Add tag</h2>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <label htmlFor="new-tag-name" className="font-medium">
            Tag name
          </label>
          <input
            id="new-tag-name"
            type="text"
            value={tagName}
            onChange={(event) => {
              setTagName(event.target.value);
              setSubmitError(undefined);
            }}
            disabled={isSubmitting}
            aria-invalid={submitError !== undefined}
            aria-describedby={submitError ? "new-tag-name-error" : undefined}
            className="max-w-md rounded border border-gray-300 px-2 py-1"
          />
          {submitError && (
            <p
              id="new-tag-name-error"
              className="m-0 text-[0.85em] text-[#b42318]"
              role="alert"
            >
              {submitError}
            </p>
          )}
        </div>

        <DbSourcesCheckboxes
          heading="Add to databases"
          headingId="add-tag-db-sources-heading"
          idPrefix="add-tag-db-source"
          activeDbSource={primaryDbSource}
          checkedSources={checkedDbSources}
          onToggle={handleToggleDbSource}
        />

        <div>
          <button
            type="submit"
            className="cursor-pointer rounded-md border border-indigo-600 bg-indigo-600 px-[0.95rem] py-[0.45rem] font-[inherit] text-[0.9rem] font-medium text-white transition-[background,border-color] duration-150 ease-in-out hover:enabled:border-indigo-700 hover:enabled:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Adding\u2026" : "Add tag"}
          </button>
        </div>
      </form>
    </>
  );
};

export default AddTagForm;

const validateTagName = (
  trimmedTagName: string,
  tags: TagListItem[],
): string | undefined => {
  if (trimmedTagName.length === 0) {
    return "Tag name is required";
  }

  if (tags.some(({ tag }) => tag.trim() === trimmedTagName)) {
    return "A tag with this name already exists";
  }

  return undefined;
};

type CreateTagOutcome =
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

const withTagId = (tag: string, tagId: string | undefined): CreateTagInput => ({
  tag,
  ...(tagId === undefined ? {} : { tagId }),
});

const createTagAcrossDbSources = async (
  tag: string,
  targets: ReadonlySet<DbSource>,
  primaryDbSource: DbSource,
): Promise<{
  tagId: string | undefined;
  notifications: string[];
  errors: string[];
}> => {
  const orderedTargets = [
    primaryDbSource,
    ...Array.from(targets).filter((source) => source !== primaryDbSource),
  ];

  const outcomes: CreateTagOutcome[] = [];
  let sharedTagId: string | undefined;

  for (const source of orderedTargets) {
    try {
      const result = await api.createTag(withTagId(tag, sharedTagId), source);
      sharedTagId ??= result.tag.tagId;

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

      if (sharedTagId === undefined) {
        break;
      }
    }
  }

  return {
    tagId: sharedTagId,
    ...buildCreateTagFeedback(outcomes),
  };
};

const formatCreateTagError = (reason: unknown): string =>
  reason instanceof Error ? reason.message : "Failed to create tag";

const buildCreateTagFeedback = (
  outcomes: CreateTagOutcome[],
): { notifications: string[]; errors: string[] } => {
  const notifications: string[] = [];
  const errors: string[] = [];

  for (const outcome of outcomes) {
    if (outcome.status === "fulfilled") {
      notifications.push(...outcome.notifications);
    } else {
      const errorMessage = `Failed to create tag in ${dbSourceLabel(outcome.source)}`;
      console.error(errorMessage, outcome.reason);

      errors.push(`${errorMessage}: ${formatCreateTagError(outcome.reason)}`);
    }
  }

  return { notifications, errors };
};
