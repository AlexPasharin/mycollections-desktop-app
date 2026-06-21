import { useEffect, useState, type FC } from "react";

import UpsertEntryForm, {
  type UpsertEntryFormCreateProps,
  type UpsertEntryFormUpdateProps,
} from "./UpsertEntryForm";
import type {
  UpsertEntryFormCreateApi,
  UpsertEntryFormUpdateApi,
} from "./upsertEntryFormApi";

import type { DbSource } from "@/db/db-source";
import type { TagListItem } from "@/types/tags";

export type { UpsertEntryFormCreateApi, UpsertEntryFormUpdateApi };

type UpsertEntryFormWrapperSharedProps = {
  primaryDbSource: DbSource;
  tags: TagListItem[];
  tagsLoading: boolean;
  tagsLoadFailed: boolean;
};

export type UpsertEntryFormWrapperUpdateProps = Omit<
  UpsertEntryFormUpdateProps,
  "tags" | "allEntryTypes" | "updateMusicalEntry"
> &
  UpsertEntryFormWrapperSharedProps & {
    mode: "update";
    api: UpsertEntryFormUpdateApi;
  };

export type UpsertEntryFormWrapperCreateProps = Omit<
  UpsertEntryFormCreateProps,
  "tags" | "allEntryTypes" | "createMusicalEntry"
> &
  UpsertEntryFormWrapperSharedProps & {
    mode: "create";
    api: UpsertEntryFormCreateApi;
  };

export type UpsertEntryFormWrapperProps =
  | UpsertEntryFormWrapperUpdateProps
  | UpsertEntryFormWrapperCreateProps;

const UpsertEntryFormWrapper: FC<UpsertEntryFormWrapperProps> = (props) => {
  const {
    mode,
    primaryDbSource,
    tags,
    tagsLoading,
    tagsLoadFailed,
    api,
    ...formProps
  } = props;

  const [allEntryTypes, setAllEntryTypes] = useState<
    Awaited<ReturnType<UpsertEntryFormUpdateApi["fetchEntryTypes"]>>
  >([]);
  const [releaseTagIds, setReleaseTagIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [loading, setLoading] = useState(true);
  const [dataLoadingFailed, setDataLoadingFailed] = useState(false);

  const fetchEntryTypes = api.fetchEntryTypes;
  const entryId = mode === "update" ? props.entry.entryId : undefined;
  const getEntryReleaseTagIds =
    mode === "update" ? api.getEntryReleaseTagIds : undefined;

  useEffect(() => {
    setLoading(true);
    setDataLoadingFailed(false);

    const loadReferenceData = async () => {
      try {
        const entryTypesData = await fetchEntryTypes(primaryDbSource);
        setAllEntryTypes(entryTypesData);

        if (
          mode === "update" &&
          getEntryReleaseTagIds !== undefined &&
          entryId !== undefined
        ) {
          const entryReleaseTagIds = await getEntryReleaseTagIds(
            entryId,
            primaryDbSource,
          );
          setReleaseTagIds(new Set(entryReleaseTagIds));
        } else {
          setReleaseTagIds(new Set());
        }
      } catch (error: unknown) {
        console.error("Error fetching data required for entry form", error);
        setDataLoadingFailed(true);
      } finally {
        setLoading(false);
      }
    };

    void loadReferenceData();
  }, [mode, primaryDbSource, entryId, fetchEntryTypes, getEntryReleaseTagIds]);

  if (loading || tagsLoading) {
    return (
      <div className="mt-4">
        <p className="m-0 text-xl font-bold">Loading&hellip;</p>
      </div>
    );
  }

  if (dataLoadingFailed || tagsLoadFailed) {
    return (
      <div className="mt-4">
        <p className="m-0 text-xl font-bold" role="alert">
          Could not load data required for the form.
        </p>
      </div>
    );
  }

  const filteredTags =
    mode === "update"
      ? tags.filter((tag) => !releaseTagIds.has(tag.tagId))
      : tags;

  if (mode === "update") {
    return (
      <UpsertEntryForm
        {...formProps}
        mode="update"
        entry={props.entry}
        updateMusicalEntry={api.updateMusicalEntry}
        primaryDbSource={primaryDbSource}
        tags={filteredTags}
        allEntryTypes={allEntryTypes}
      />
    );
  }

  return (
    <UpsertEntryForm
      {...formProps}
      mode="create"
      artistId={props.artistId}
      createMusicalEntry={api.createMusicalEntry}
      primaryDbSource={primaryDbSource}
      tags={filteredTags}
      allEntryTypes={allEntryTypes}
    />
  );
};

export default UpsertEntryFormWrapper;
