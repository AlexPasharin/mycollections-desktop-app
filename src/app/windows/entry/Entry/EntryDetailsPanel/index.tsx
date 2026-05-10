import { type FC } from "react";

import styles from "./EntryDetailsPanel.module.css";

import DataWithErrorDisplay from "@/app/components/DataWithErrorDisplay";
import type { EntryByIdResult } from "@/types/entries";
import { formatGeneralizedDate } from "@/utils/date";

type EntryDetailsPanelProps = {
  entry: EntryByIdResult;
};

const EntryDetailsPanel: FC<EntryDetailsPanelProps> = ({ entry }) => (
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
        {entry.altNames.map(({ name }) => name).join(", ")}
      </p>
    )}

    <div className={styles.field}>
      <span className={styles.fieldLabel}>Original release date: </span>
      {entry.originalReleaseDate === null ? (
        "(Unknown)"
      ) : "error" in entry.originalReleaseDate ? (
        <DataWithErrorDisplay
          value={entry.originalReleaseDate.value}
          error={entry.originalReleaseDate.error}
        />
      ) : (
        formatGeneralizedDate(entry.originalReleaseDate)
      )}
    </div>

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

    {entry.tags.length > 0 && (
      <div className={styles.field}>
        <span className={styles.fieldLabel}>Tags:</span>
        <ul className={styles.typesList}>
          {entry.tags.map((tag) => (
            <li key={tag} className={styles.tagsListItem}>
              {tag}
            </li>
          ))}
        </ul>
      </div>
    )}

    {entry.comment && (
      <div>
        <p className={styles.comment}>{entry.comment}</p>
      </div>
    )}
  </div>
);

export default EntryDetailsPanel;
