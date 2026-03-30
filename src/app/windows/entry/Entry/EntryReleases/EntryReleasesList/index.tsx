import { type FC, useState } from "react";

import styles from "./EntryReleasesList.module.css";

import api from "../../../api";
import EntryRelease from "../EntryRelease";

import type { EntryByIdResult } from "@/types/entries";
import type {
  EntryRelease as EntryReleaseRow,
  ReleaseByIdResult,
} from "@/types/releases";
import { updateImmutableSet } from "@/utils/immutableSet";

type EntryReleasesListProps = {
  entry: EntryByIdResult;
  releases: EntryReleaseRow[];
};

const EntryReleasesList: FC<EntryReleasesListProps> = ({ entry, releases }) => {
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [detailsCache, setDetailsCache] = useState<
    Record<string, ReleaseByIdResult>
  >({});
  const [failedIds, setFailedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [loadingIds, setLoadingIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const toggleRelease = (releaseId: string) => {
    if (expandedIds.has(releaseId)) {
      setExpandedIds(updateImmutableSet(releaseId, "remove"));

      return;
    }

    setExpandedIds(updateImmutableSet(releaseId, "add"));

    if (releaseId in detailsCache) {
      return;
    }

    setFailedIds(updateImmutableSet(releaseId, "remove"));
    setLoadingIds(updateImmutableSet(releaseId, "add"));

    api
      .getReleaseById(releaseId)
      .then((row) => {
        if (!row) {
          throw new Error("Release not found");
        }

        setDetailsCache((prev) => ({
          ...prev,
          [releaseId]: row,
        }));
      })
      .catch((error: unknown) => {
        console.error("Error loading release details", error);
        setFailedIds(updateImmutableSet(releaseId, "add"));
      })
      .finally(() => {
        setLoadingIds(updateImmutableSet(releaseId, "remove"));
      });
  };

  return (
    <ul className={styles.releasesList}>
      {releases.map((r) => (
        <EntryRelease
          key={r.releaseId}
          entry={entry}
          release={r}
          isExpanded={expandedIds.has(r.releaseId)}
          onToggle={() => toggleRelease(r.releaseId)}
          releaseDetails={detailsCache[r.releaseId]}
          loadFailed={failedIds.has(r.releaseId)}
          isLoading={loadingIds.has(r.releaseId)}
        />
      ))}
    </ul>
  );
};

export default EntryReleasesList;
