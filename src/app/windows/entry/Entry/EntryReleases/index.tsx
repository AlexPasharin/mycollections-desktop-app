import { useCallback, useEffect, useRef, useState, type FC } from "react";

import styles from "./EntryReleases.module.css";
import EntryReleasesList from "./EntryReleasesList";

import api from "../../api";

import type { EntryByIdResult } from "@/types/entries";
import type { EntryRelease } from "@/types/releases";

type EntryReleasesProps = {
  entry: EntryByIdResult;
  isActive: boolean;
  latestAddedReleaseId: string | undefined;
};

const EntryReleases: FC<EntryReleasesProps> = ({
  entry,
  isActive,
  latestAddedReleaseId,
}) => {
  const [releases, setReleases] = useState<EntryRelease[]>();
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [recentlyDeletedVersion, setRecentlyDeletedVersion] =
    useState<string>();

  // Token bumped on every fetch / unmount; in-flight responses with a stale
  // token are discarded so we never setState on stale data or after unmount.
  const fetchTokenRef = useRef(0);

  const fetchReleases = useCallback(() => {
    const token = ++fetchTokenRef.current;
    setLoading(true);
    setLoadFailed(false);
    setReleases(undefined);

    api
      .getEntryReleases(entry.entryId)
      .then((data) => {
        if (token !== fetchTokenRef.current) {
          return;
        }

        setReleases(data);
        setLoading(false);
      })
      .catch((error: unknown) => {
        console.error("Error getting entry releases", error);

        if (token !== fetchTokenRef.current) {
          return;
        }

        setLoadFailed(true);
        setReleases([]);
        setLoading(false);
      });
  }, [entry.entryId]);

  // Re-fetch every time this tab becomes active, so the list is always fresh
  // after the user has been on the "Add release" tab (including right after a
  // successful submission, which switches `activeTab` back to "releases").
  useEffect(() => {
    if (!isActive) {
      return;
    }

    fetchReleases();

    return () => {
      // Invalidate the in-flight fetch (if any) so its setState is skipped.
      fetchTokenRef.current += 1;
    };
  }, [isActive, fetchReleases]);

  const handleReleaseDeleted = (deletedReleaseVersion: string) => {
    setRecentlyDeletedVersion(deletedReleaseVersion);
    fetchReleases();
  };

  const dismissDeletedNotification = () => {
    setRecentlyDeletedVersion(undefined);
  };

  if (loading) {
    return <p className={styles.emptyState}>Loading releases&hellip;</p>;
  }

  if (loadFailed) {
    return <p className={styles.emptyState}>Could not load releases.</p>;
  }

  const deletedNotification = !!recentlyDeletedVersion && (
    <div className={styles.deletedNotification} role="status">
      <span className={styles.deletedNotificationText}>
        Release &quot;{recentlyDeletedVersion}&quot; was deleted successfully.
      </span>
      <button
        type="button"
        className={styles.deletedNotificationDismiss}
        onClick={dismissDeletedNotification}
        aria-label="Dismiss notification"
      >
        Dismiss
      </button>
    </div>
  );

  if (!releases || releases.length === 0) {
    return (
      <>
        <p className={styles.emptyState}>
          This entry has no releases in collection
        </p>
        {deletedNotification}
      </>
    );
  }

  return (
    <div className={styles.panel}>
      <h2 className={styles.sectionTitle}>Releases in collection: </h2>
      <div className={styles.field}>
        <EntryReleasesList
          entry={entry}
          releases={releases}
          latestAddedReleaseId={latestAddedReleaseId}
          onReleaseDeleted={handleReleaseDeleted}
        />
      </div>
      {deletedNotification}
    </div>
  );
};

export default EntryReleases;
