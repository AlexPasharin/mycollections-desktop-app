import { type FC } from "react";

import styles from "./EntryDetailsPanel.module.css";

import DataWithErrorDisplay from "@/app/components/DataWithErrorDisplay";
import type { EntryByIdResult } from "@/types/entries";
import { formatGeneralizedDate } from "@/utils/date";

type EntryDetailsPanelProps = {
  entry: EntryByIdResult;
};

const EntryDetailsPanel: FC<EntryDetailsPanelProps> = ({ entry }) => {
  const {
    types,
    altNames,
    originalReleaseDate,
    discogsUrl,
    partOfQueenCollection,
    relationToQueen,
    tags,
    comment,
  } = entry;

  return (
    <div className={styles.entryPanel}>
      <div className={styles.field}>
        {types.length > 0 ? (
          <ul className={styles.typesList}>
            {types.map((typeName) => (
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

      {altNames.length > 0 && (
        <p className={styles.field}>
          <span className={styles.fieldLabel}>Also known as: </span>
          {altNames.map(({ name }) => name).join(", ")}
        </p>
      )}

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Original release date: </span>
        {originalReleaseDate === null ? (
          "(Unknown)"
        ) : "error" in originalReleaseDate ? (
          <DataWithErrorDisplay
            value={originalReleaseDate.value}
            error={originalReleaseDate.error}
          />
        ) : (
          formatGeneralizedDate(originalReleaseDate)
        )}
      </div>

      {discogsUrl && (
        <p className={styles.field}>
          <span className={styles.fieldLabel}>Discogs url: </span>
          <a href={discogsUrl} target="_blank" rel="noreferrer">
            {discogsUrl}
          </a>
        </p>
      )}

      {partOfQueenCollection && (
        <p className={styles.field}>
          <span className={styles.fieldLabelItalic}>
            Part of Queen collection
          </span>
        </p>
      )}

      {relationToQueen && (
        <p className={styles.field}>
          <span className={styles.fieldLabel}>Relation to Queen: </span>
          {relationToQueen}
        </p>
      )}

      {tags.length > 0 && (
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Tags:</span>
          <ul className={styles.typesList}>
            {tags.map((tag) => (
              <li key={tag} className={styles.tagsListItem}>
                {tag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {comment && (
        <div>
          <p className={styles.comment}>{comment}</p>
        </div>
      )}
    </div>
  );
};

export default EntryDetailsPanel;
