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
import type { GetEntryReleaseTagIds } from "@/types/releases";
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
    api: UpsertEntryFormUpdateApi;
  };

export type UpsertEntryFormWrapperCreateProps = Omit<
  UpsertEntryFormCreateProps,
  "tags" | "allEntryTypes" | "createMusicalEntry"
> &
  UpsertEntryFormWrapperSharedProps & {
    api: UpsertEntryFormCreateApi;
  };

export type UpsertEntryFormWrapperProps =
  | UpsertEntryFormWrapperUpdateProps
  | UpsertEntryFormWrapperCreateProps;

const UpsertEntryFormWrapper: FC<UpsertEntryFormWrapperProps> = ({
  mode,
  primaryDbSource,
  tags,
  tagsLoading,
  tagsLoadFailed,
  api,
  entry,
  artistId,
  ...rest
}) => {
  const [allEntryTypes, setAllEntryTypes] = useState<
    Awaited<ReturnType<UpsertEntryFormUpdateApi["fetchEntryTypes"]>>
  >([]);
  const [releaseTagIds, setReleaseTagIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [loading, setLoading] = useState(true);
  const [dataLoadingFailed, setDataLoadingFailed] = useState(false);

  const fetchEntryTypes = api.fetchEntryTypes;
  const entryId = entry?.entryId;

  const getEntryReleaseTagIds =
    mode === "update" ? api.getEntryReleaseTagIds : undefined;

  useEffect(() => {
    setLoading(true);
    setDataLoadingFailed(false);

    Promise.all([
      fetchEntryTypes(primaryDbSource),
      loadEntryReleaseTagIds({
        getEntryReleaseTagIds,
        entryId,
        primaryDbSource,
      }),
    ])
      .then(([entryTypesData, entryReleaseTagIds]) => {
        setAllEntryTypes(entryTypesData);
        setReleaseTagIds(entryReleaseTagIds);
      })
      .catch((error: unknown) => {
        console.error("Error fetching data required for entry form", error);
        setDataLoadingFailed(true);
      })
      .finally(() => {
        setLoading(false);
      });
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

  const sharedProps = {
    ...rest,
    primaryDbSource,
    tags: filteredTags,
    allEntryTypes,
  };

  const childProps =
    mode === "update"
      ? {
          mode,
          entry,
          updateMusicalEntry: api.updateMusicalEntry,
        }
      : {
          mode,
          artistId,
          createMusicalEntry: api.createMusicalEntry,
        };

  return <UpsertEntryForm {...sharedProps} {...childProps} />;
};

export default UpsertEntryFormWrapper;

type LoadEntryReleaseTagIdsParams = {
  getEntryReleaseTagIds: GetEntryReleaseTagIds | undefined;
  entryId: string | undefined;
  primaryDbSource: DbSource;
};

const loadEntryReleaseTagIds = async ({
  getEntryReleaseTagIds,
  entryId,
  primaryDbSource,
}: LoadEntryReleaseTagIdsParams): Promise<Set<string>> => {
  if (getEntryReleaseTagIds !== undefined && entryId !== undefined) {
    const entryReleaseTagIds = await getEntryReleaseTagIds(
      entryId,
      primaryDbSource,
    );

    return new Set(entryReleaseTagIds);
  }

  return new Set();
};
