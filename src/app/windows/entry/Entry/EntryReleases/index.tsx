import { type FC } from "react";

import styles from "./EntryReleases.module.css";

import type { EntryRelease } from "@/types/releases";

type EntryReleasesProps = {
  releases: EntryRelease[];
};

const EntryReleases: FC<EntryReleasesProps> = ({ releases }) => {
  if (releases.length === 0) {
    return (
      <p className={styles.emptyState}>
        This entry has no releases in collection
      </p>
    );
  }

  return (
    <div className={styles.panel}>
      <h2 className={styles.sectionTitle}>Releases in collection</h2>
      <div className={styles.field}>
        <ul className={styles.releasesList}>
          {releases.map((r) => (
            <li key={r.releaseId} className={styles.releasesListItem}>
              <span className={styles.releaseVersion}>{r.version}</span>
              {r.formats.length > 0 && ` (${r.formats.join(", ")})`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EntryReleases;
