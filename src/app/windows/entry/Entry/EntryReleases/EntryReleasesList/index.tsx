import { type FC, useCallback, useState } from "react";

import styles from "./EntryReleasesList.module.css";

import api from "../../../api";
import EntryRelease from "../EntryRelease";

import type {
  EntryRelease as EntryReleaseRow,
  ReleaseByIdResult,
} from "@/types/releases";

type EntryReleasesListProps = {
  releases: EntryReleaseRow[];
};

const EntryReleasesList: FC<EntryReleasesListProps> = ({ releases }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailsCache, setDetailsCache] = useState<
    Record<string, ReleaseByIdResult | false>
  >({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const toggleRelease = useCallback(
    async (releaseId: string) => {
      if (expandedId === releaseId) {
        setExpandedId(null);

        return;
      }

      setExpandedId(releaseId);

      if (releaseId in detailsCache) {
        return;
      }

      setLoadingId(releaseId);

      try {
        const row = await api.getReleaseById(releaseId);
        setDetailsCache((prev) => ({
          ...prev,
          [releaseId]: row ?? false,
        }));
      } catch (error: unknown) {
        console.error("Error loading release details", error);
        setDetailsCache((prev) => ({ ...prev, [releaseId]: false }));
      } finally {
        setLoadingId(null);
      }
    },
    [detailsCache, expandedId],
  );

  return (
    <ul className={styles.releasesList}>
      {releases.map((r) => (
        <EntryRelease
          key={r.releaseId}
          release={r}
          isExpanded={expandedId === r.releaseId}
          onToggle={() => {
            void toggleRelease(r.releaseId);
          }}
          cached={detailsCache[r.releaseId]}
          isLoading={loadingId === r.releaseId}
        />
      ))}
    </ul>
  );
};

export default EntryReleasesList;
