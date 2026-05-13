import { type FC, useRef, useState } from "react";

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
  latestAddedReleaseId: string | undefined;
};

const EntryReleasesList: FC<EntryReleasesListProps> = ({
  entry,
  releases,
  latestAddedReleaseId,
}) => {
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [releaseDetails, setReleaseDetails] = useState<
    Map<string, ReleaseByIdResult>
  >(() => new Map());
  const expandedIdsRef = useRef(expandedIds);
  expandedIdsRef.current = expandedIds;
  const [failedIds, setFailedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [loadingIds, setLoadingIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const toggleRelease = (releaseId: string) => {
    const dropReleaseDetails = () => {
      setReleaseDetails((prev) => {
        const next = new Map(prev);
        next.delete(releaseId);

        return next;
      });
    };

    if (expandedIds.has(releaseId)) {
      dropReleaseDetails();

      setExpandedIds(updateImmutableSet(releaseId, "remove"));
      setFailedIds(updateImmutableSet(releaseId, "remove"));
      setLoadingIds(updateImmutableSet(releaseId, "remove"));

      return;
    }

    dropReleaseDetails();
    setExpandedIds(updateImmutableSet(releaseId, "add"));
    setFailedIds(updateImmutableSet(releaseId, "remove"));
    setLoadingIds(updateImmutableSet(releaseId, "add"));

    api
      .getReleaseById(releaseId)
      .then((row) => {
        if (!expandedIdsRef.current.has(releaseId)) {
          return;
        }

        if (!row) {
          throw new Error("Release not found");
        }

        setReleaseDetails((prev) => {
          const next = new Map(prev);
          next.set(releaseId, row);

          return next;
        });
      })
      .catch((error: unknown) => {
        if (!expandedIdsRef.current.has(releaseId)) {
          return;
        }

        console.error("Error loading release details", error);
        setFailedIds(updateImmutableSet(releaseId, "add"));
      })
      .finally(() => {
        if (!expandedIdsRef.current.has(releaseId)) {
          return;
        }

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
          releaseDetails={releaseDetails.get(r.releaseId)}
          loadFailed={failedIds.has(r.releaseId)}
          isLoading={loadingIds.has(r.releaseId)}
          isRecentlyAdded={r.releaseId === latestAddedReleaseId}
        />
      ))}
    </ul>
  );
};

export default EntryReleasesList;
