import { useState, type FC } from "react";

import AddReleaseForm from "./AddReleaseForm";
import styles from "./Entry.module.css";
import EntryArtists from "./EntryArtists";
import EntryDetailsPanel from "./EntryDetailsPanel";
import EntryReleases from "./EntryReleases";

import type { EntryByIdResult } from "@/types/entries";
import { sanitizeReleaseDate } from "@/utils/date";

type EntryProps = {
  entry: EntryByIdResult;
};

const Entry: FC<EntryProps> = ({ entry }) => {
  const [showReleases, setShowReleases] = useState(false);
  const [addReleaseFormOpen, setAddReleaseFormOpen] = useState(true);

  return (
    <div>
      <h1>{entry.mainName}</h1>

      <EntryArtists artists={entry.artists} />

      <EntryDetailsPanel entry={entry} />

      <div className={styles.buttons}>
        <button type="button" onClick={() => setShowReleases(true)}>
          Show releases
        </button>
        <button
          type="button"
          onClick={() => {
            setAddReleaseFormOpen(true);
            setShowReleases(false);
          }}
        >
          Add new release
        </button>
      </div>

      {addReleaseFormOpen && (
        <AddReleaseForm
          entry={{ ...entry, originalReleaseDate: sanitizeReleaseDate(entry.originalReleaseDate) }}
          onCancel={() => setAddReleaseFormOpen(false)}
        />
      )}

      {showReleases && (
        <div className={styles.releasesSection}>
          <EntryReleases entry={entry} />
        </div>
      )}
    </div>
  );
};

export default Entry;


