import { type FC } from "react";

import styles from "./Entry.module.css";
import EntryArtists from "./EntryArtists";

import type { EntryByIdResult } from "@/types/entries";

type EntryProps = {
  entry: EntryByIdResult;
};

const Entry: FC<EntryProps> = ({ entry }) => {
  return (
    <div>
      <h1>{entry.mainName}</h1>

      <EntryArtists artists={entry.artists} />

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
              (Types of this entry are not known, please update types of this
              entry in the database)
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

        {entry.discogsUrl ? (
          <p className={styles.field}>
            <span className={styles.fieldLabel}>Discogs: </span>
            <a href={entry.discogsUrl} target="_blank" rel="noreferrer">
              {entry.discogsUrl}
            </a>
          </p>
        ) : null}

        {entry.partOfQueenCollection || entry.relationToQueen ? (
          <p className={styles.field}>
            <span className={styles.fieldLabel}>Queen collection: </span>
            {entry.partOfQueenCollection ? "Yes" : "No"}
            {entry.relationToQueen ? ` · ${entry.relationToQueen}` : null}
          </p>
        ) : null}

        {entry.comment ? (
          <div>
            <p className={styles.fieldLabel}>Comment</p>
            <p className={styles.comment}>{entry.comment}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Entry;
