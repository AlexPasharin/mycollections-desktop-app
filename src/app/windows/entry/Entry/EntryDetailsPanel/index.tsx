import { type FC } from "react";

import styles from "./EntryDetailsPanel.module.css";

import type { EntryByIdResult } from "@/types/entries";
import type { EntryRelease } from "@/types/releases";

type EntryDetailsPanelProps = {
  entry: EntryByIdResult;
  releases: EntryRelease[];
};

const EntryDetailsPanel: FC<EntryDetailsPanelProps> = ({ entry, releases }) => (
  <div className={styles.entryPanel}>
    <div className={styles.field}>
      {entry.types.length > 0 ? (
        <ul className={styles.typesList}>
          {entry.types.map((typeName) => (
            <li key={typeName} className={styles.typesListItem}>
              {typeName}
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.italicNote}>
          (Types of this entry are not known, please update types of this entry
          in the database)
        </p>
      )}
    </div>

    {entry.altNames.length > 0 && (
      <p className={styles.field}>
        <span className={styles.fieldLabel}>Also known as: </span>
        {entry.altNames.join(", ")}
      </p>
    )}

    <p className={styles.field}>
      <span className={styles.fieldLabel}>Original release date: </span>
      {entry.originalReleaseDate ?? "(Unknown)"}
    </p>

    {releases.length > 0 && (
      <div className={styles.field}>
        <span className={styles.fieldLabel}>Releases: </span>
        <ul className={styles.typesList}>
          {releases.map((r) => (
            <li key={r.releaseId} className={styles.typesListItem}>
              {r.version}
              {r.formats.length > 0 ? ` (${r.formats.join(", ")})` : ""}
            </li>
          ))}
        </ul>
      </div>
    )}

    {entry.discogsUrl && (
      <p className={styles.field}>
        <span className={styles.fieldLabel}>Discogs url: </span>
        <a href={entry.discogsUrl} target="_blank" rel="noreferrer">
          {entry.discogsUrl}
        </a>
      </p>
    )}

    {entry.partOfQueenCollection && (
      <p className={styles.field}>
        <span className={styles.fieldLabelItalic}>
          Part of Queen collection
        </span>
      </p>
    )}

    {entry.relationToQueen && (
      <p className={styles.field}>
        <span className={styles.fieldLabel}>Relation to Queen: </span>
        {entry.relationToQueen}
      </p>
    )}

    {entry.comment && (
      <div>
        <p className={styles.comment}>{entry.comment}</p>
      </div>
    )}
  </div>
);

export default EntryDetailsPanel;
