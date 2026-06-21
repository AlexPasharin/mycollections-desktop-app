import { useEffect, useRef, useState, type FC } from "react";

import api from "../api";

import UpsertEntryForm from "@/app/components/UpsertEntryForm";
import type { UpsertEntryFormPersistedState } from "@/app/components/UpsertEntryForm/upsertEntryFormUtils/formValues";
import type { DbSource } from "@/db/db-source";
import type { EntryByIdResult } from "@/types/entries";
import type { TagListItem } from "@/types/tags";

type ArtistAddEntryFormProps = {
  artistId: string;
  primaryDbSource: DbSource;
  onCancel: () => void;
  onEntrySaved: (notifications: string[], errors: string[]) => void;
};

const ArtistAddEntryForm: FC<ArtistAddEntryFormProps> = ({
  artistId,
  primaryDbSource,
  onCancel,
  onEntrySaved,
}) => {
  const [tags, setTags] = useState<TagListItem[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [tagsLoadFailed, setTagsLoadFailed] = useState(false);
  const createEntryDraftRef = useRef<UpsertEntryFormPersistedState | null>(
    null,
  );
  const fetchTagsTokenRef = useRef(0);
  const tagsDbSourceRef = useRef<DbSource | null>(null);

  useEffect(() => {
    if (tagsDbSourceRef.current === primaryDbSource) {
      return;
    }

    const token = ++fetchTagsTokenRef.current;
    setTagsLoading(true);
    setTagsLoadFailed(false);

    api
      .fetchTags(primaryDbSource)
      .then((tagsData) => {
        if (token !== fetchTagsTokenRef.current) {
          return;
        }

        setTags(tagsData);
        tagsDbSourceRef.current = primaryDbSource;
        setTagsLoading(false);
      })
      .catch((error: unknown) => {
        console.error("Error fetching tags", error);

        if (token !== fetchTagsTokenRef.current) {
          return;
        }

        setTagsLoadFailed(true);
        setTagsLoading(false);
      });

    return () => {
      fetchTagsTokenRef.current += 1;
    };
  }, [primaryDbSource]);

  const handleEntrySaved = (
    _entry: EntryByIdResult,
    notifications: string[],
    errors: string[],
  ) => {
    createEntryDraftRef.current = null;
    onEntrySaved(notifications, errors);
  };

  const handleCancel = () => {
    createEntryDraftRef.current = null;
    onCancel();
  };

  return (
    <UpsertEntryForm
      mode="create"
      artistId={artistId}
      primaryDbSource={primaryDbSource}
      tags={tags}
      tagsLoading={tagsLoading}
      tagsLoadFailed={tagsLoadFailed}
      api={{
        fetchEntryTypes: api.fetchEntryTypes,
        createMusicalEntry: api.createMusicalEntry,
      }}
      restoredState={createEntryDraftRef.current}
      onPersistState={(state) => {
        createEntryDraftRef.current = state;
      }}
      onCancel={handleCancel}
      onEntrySaved={handleEntrySaved}
    />
  );
};

export default ArtistAddEntryForm;
