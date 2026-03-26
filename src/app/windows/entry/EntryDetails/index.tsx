import { type FC } from "react";

import styles from "./EntryDetails.module.css";

import type { EntryByIdResult } from "@/types/entries";

type EntryDetailsProps = {
  entry: EntryByIdResult;
};

const EntryDetails: FC<EntryDetailsProps> = ({ entry }) => (
  <div>
    <h1 >{entry.mainName}</h1>

    <div className={styles.entryPanel}>

      <div className={styles.field}>
        {entry.types.length > 0 ? (
          <ul className={styles.typesList}>
            {entry.types.map((typeName) => (
              <li key={typeName} className={styles.typesListItem}>{typeName}</li>
            ))}
          </ul>
        ) : (
          <p className={styles.italicNote}>
            {
              " (Types of this entry are not known, please update types of this entry in the database)"
            }
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

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Artists</span>
        {entry.artists.length > 0 ? (
          <ul className={styles.artistsList}>
            {entry.artists.map((a) => (
              <li key={`${a.artistId}-${a.artistName ?? ""}`}>
                {a.artistName ?? "(unnamed)"}
                {a.isEntriesMainArtist ? " · main" : null}
              </li>
            ))}
          </ul>
        ) : (
          " —"
        )}
      </div>

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


export default EntryDetails;
