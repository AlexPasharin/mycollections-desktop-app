import { type FC } from "react";

import styles from "./EntryReleases.module.css";
import EntryReleasesList from "./EntryReleasesList";

import type { EntryByIdResult } from "@/types/entries";
import type { EntryRelease } from "@/types/releases";

type EntryReleasesProps = {
  entry: EntryByIdResult;
  releases: EntryRelease[];
};

const EntryReleases: FC<EntryReleasesProps> = ({ entry, releases }) => {
  if (releases.length === 0) {
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
