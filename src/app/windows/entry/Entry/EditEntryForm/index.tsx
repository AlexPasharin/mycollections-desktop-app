import { useEffect, useState, type FC } from "react";

import EditEntryForm, { type EditEntryFormProps } from "./EditEntryForm";
import styles from "./EditEntryForm.module.css";

import api from "@/app/windows/entry/api";
import type { DbSource } from "@/db/db-source";
import type { EntryTypeListItem } from "@/types/entryTypes";

type EditEntryFormWrapperProps = Omit<
  EditEntryFormProps,
  "sortedTagEntries" | "allEntryTypes"
> & {
  primaryDbSource: DbSource;
  tagsLoading: boolean;
  tagsLoadFailed: boolean;
};

const EditEntryFormWrapper: FC<EditEntryFormWrapperProps> = ({
  primaryDbSource,
  tags,
  tagsLoading,
  tagsLoadFailed,
  ...formProps
}) => {
  const [allEntryTypes, setAllEntryTypes] = useState<EntryTypeListItem[]>([]);
  const [releaseTagIds, setReleaseTagIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [loading, setLoading] = useState(true);
  const [dataLoadingFailed, setDataLoadingFailed] = useState(false);

  useEffect(() => {
    Promise.all([
      api.fetchEntryTypes(primaryDbSource),
      api.getEntryReleaseTagIds(formProps.entry.entryId, primaryDbSource),
    ])
      .then(([entryTypesData, entryReleaseTagIds]) => {
        setAllEntryTypes(entryTypesData);
        setReleaseTagIds(new Set(entryReleaseTagIds));
      })
      .catch((error: unknown) => {
        console.error("Error fetching entry types or release tags", error);
        setDataLoadingFailed(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [primaryDbSource, formProps.entry.entryId]);

  if (loading || tagsLoading) {
    return (
      <div className={styles.section}>
        <p className={styles.dataLoadState}>Loading&hellip;</p>
      </div>
    );
  }

  if (dataLoadingFailed || tagsLoadFailed) {
    return (
      <div className={styles.section}>
        <p className={styles.dataLoadState} role="alert">
          Could not load data required for the form.
        </p>
      </div>
    );
  }

  return (
    <EditEntryForm
      {...formProps}
      primaryDbSource={primaryDbSource}
      tags={tags.filter((t) => !releaseTagIds.has(t.tagId))}
      allEntryTypes={allEntryTypes}
    />
  );
};

export default EditEntryFormWrapper;
