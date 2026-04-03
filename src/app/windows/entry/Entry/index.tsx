import { useState, type FC } from "react";

import EntryArtists from "./EntryArtists";
import EntryDetailsPanel from "./EntryDetailsPanel";
import EntryReleases from "./EntryReleases";
import styles from "./Entry.module.css";

import type { EntryByIdResult } from "@/types/entries";
import type { EntryRelease } from "@/types/releases";

type EntryProps = {
  entry: EntryByIdResult;
  releases: EntryRelease[];
};

const Entry: FC<EntryProps> = ({ entry, releases }) => {
  const [showReleases, setShowReleases] = useState(false);

  return (
    <div>
      <h1>{entry.mainName}</h1>

      <EntryArtists artists={entry.artists} />

      <EntryDetailsPanel entry={entry} />

      <div className={styles.buttons}>
        <button
          type="button"
          onClick={() => setShowReleases(true)}
        >
          Show releases
        </button>
        <button type="button">Add new release</button>
      </div>

      {showReleases && (
        <div className={styles.releasesSection}>
          <EntryReleases entry={entry} releases={releases} />
        </div>
      )}
    </div>
  );
};

export default Entry;
