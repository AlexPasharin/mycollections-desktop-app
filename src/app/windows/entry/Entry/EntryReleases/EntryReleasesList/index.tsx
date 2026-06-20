import { type FC, useEffect, useRef, useState } from "react";

import styles from "./EntryReleasesList.module.css";

import api from "../../../api";
import EntryRelease from "../EntryRelease";

import type { DbSource } from "@/db/db-source";
import type { CountryListItem } from "@/types/countries";
import type { EntryByIdResult } from "@/types/entries";
import type {
  EntryRelease as EntryReleaseRow,
  ReleaseByIdResult,
} from "@/types/releases";
import { updateImmutableSet } from "@/utils/immutableSet";

type EntryReleasesListProps = {
  entry: EntryByIdResult;
  dbSource: DbSource;
  releases: EntryReleaseRow[];
  allCountries: CountryListItem[];
  latestAddedReleaseId: string | undefined;
  latestUpdatedReleaseId: string | undefined;
  onUseReleaseAsBlueprint: (releaseBlueprint: ReleaseByIdResult) => void;
  onEditRelease: (release: ReleaseByIdResult) => void;
  onReleaseDeleted: (deletedReleaseVersion: string, errors: string[]) => void;
};

const EntryReleasesList: FC<EntryReleasesListProps> = ({
  entry,
  dbSource,
  releases,
  allCountries,
  latestAddedReleaseId,
  latestUpdatedReleaseId,
  onUseReleaseAsBlueprint,
  onEditRelease,
  onReleaseDeleted,
}) => {
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [releaseDetails, setReleaseDetails] = useState<
    Map<string, ReleaseByIdResult>
  >(() => new Map());

  // Per-release token bumped on collapse / remount; stale in-flight responses
  // are discarded so we never setState on outdated expand cycles.
  const fetchDetailsTokenRef = useRef(new Map<string, number>());
  const [failedIds, setFailedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [loadingIds, setLoadingIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  useEffect(
    () => () => {
      fetchDetailsTokenRef.current.clear();
    },
    [],
  );

  const toggleRelease = (releaseId: string) => {
    const isCurrentlyOpen = expandedIds.has(releaseId);
    const tokens = fetchDetailsTokenRef.current;

    const token = (tokens.get(releaseId) ?? 0) + 1;
    tokens.set(releaseId, token);

    setExpandedIds(
      updateImmutableSet(releaseId, isCurrentlyOpen ? "remove" : "add"),
    );
    setLoadingIds(
      updateImmutableSet(releaseId, isCurrentlyOpen ? "remove" : "add"),
    );
    setFailedIds(updateImmutableSet(releaseId, "remove"));

    setReleaseDetails((prev) => {
      const next = new Map(prev);
      next.delete(releaseId);

      return next;
    });

    if (isCurrentlyOpen) {
      return;
    }

    api
      .getReleaseById(releaseId, dbSource)
      .then((row) => {
        if (tokens.get(releaseId) !== token) {
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
        if (tokens.get(releaseId) !== token) {
          return;
        }

        console.error("Error loading release details", error);
        setFailedIds(updateImmutableSet(releaseId, "add"));
      })
      .finally(() => {
        if (tokens.get(releaseId) !== token) {
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
          dbSource={dbSource}
          release={r}
          allCountries={allCountries}
          isExpanded={expandedIds.has(r.releaseId)}
          onToggle={() => toggleRelease(r.releaseId)}
          releaseDetails={releaseDetails.get(r.releaseId)}
          loadFailed={failedIds.has(r.releaseId)}
          isLoading={loadingIds.has(r.releaseId)}
          isRecentlyAdded={r.releaseId === latestAddedReleaseId}
          isRecentlyEdited={r.releaseId === latestUpdatedReleaseId}
          onUseAsBlueprint={onUseReleaseAsBlueprint}
          onEdit={onEditRelease}
          onDeleted={onReleaseDeleted}
        />
      ))}
    </ul>
  );
};

export default EntryReleasesList;
