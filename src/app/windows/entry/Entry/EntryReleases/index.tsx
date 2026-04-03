import { useEffect, useState, type FC } from "react";

import styles from "./EntryReleases.module.css";
import EntryReleasesList from "./EntryReleasesList";

import api from "../../api";

import type { EntryByIdResult } from "@/types/entries";
import type { EntryRelease } from "@/types/releases";

type EntryReleasesProps = {
  entry: EntryByIdResult;
};

const EntryReleases: FC<EntryReleasesProps> = ({ entry }) => {
  const [releases, setReleases] = useState<EntryRelease[]>();
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadFailed(false);
    setReleases(undefined);

    api
      .getEntryReleases(entry.entryId)
      .then((data) => {
        if (!cancelled) {
          setReleases(data);
          setLoading(false);
        }
      })
      .catch((error: unknown) => {
        console.error("Error getting entry releases", error);

        if (!cancelled) {
          setLoadFailed(true);
          setReleases([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [entry.entryId]);

  if (loading) {
    return <p className={styles.emptyState}>Loading releases&hellip;</p>;
  }

  if (loadFailed) {
    return <p className={styles.emptyState}>Could not load releases.</p>;
  }

  if (!releases || releases.length === 0) {
    return (
      <p className={styles.emptyState}>
        This entry has no releases in collection
      </p>
    );
  }

  return (
    <div className={styles.panel}>
      <h2 className={styles.sectionTitle}>Releases in collection: </h2>
      <div className={styles.field}>
        <EntryReleasesList entry={entry} releases={releases} />
      </div>
    </div>
  );
};

export default EntryReleases;
