import { type FC } from "react";

import { formatJson } from "./formatJson";
import JsonFieldErrorDisplay from "./JsonFieldErrorDisplay";
import ReleaseCatNumbers from "./ReleaseCatNumbers";
import ReleaseCountries from "./ReleaseCountries";
import styles from "./ReleaseDetails.module.css";
import ReleaseFormatItem from "./ReleaseFormatItem";

import type { EntryByIdResult } from "@/types/entries";
import type { JsonParsingErrorData, ReleaseByIdResult } from "@/types/releases";

type ReleaseDetailsProps = {
  entry: EntryByIdResult;
  release: ReleaseByIdResult;
};

const isMatrixRunoutParseError = (
  value: ReleaseByIdResult["matrixRunout"],
): value is JsonParsingErrorData =>
  typeof value === "object" &&
  value !== null &&
  "rawJson" in value &&
  "error" in value;

const ReleaseMatrixRunout: FC<{
  matrixRunout: ReleaseByIdResult["matrixRunout"];
}> = ({ matrixRunout }) => {
  if (matrixRunout === null) {
    return null;
  }

  if (isMatrixRunoutParseError(matrixRunout)) {
    return (
      <div className={styles.detailBlock}>
        <span className={styles.detailLabel}>Matrix / runout:</span>
        <JsonFieldErrorDisplay {...matrixRunout} />
      </div>
    );
  }

  const formatted = formatJson(matrixRunout);

  if (!formatted) {
    return null;
  }

  return (
    <div className={styles.detailBlock}>
      <span className={styles.detailLabel}>Matrix / runout:</span>
      <pre className={styles.jsonPre}>{formatted}</pre>
    </div>
  );
};

const ReleaseDetails: FC<ReleaseDetailsProps> = ({ entry, release }) => (
  <div className={styles.releaseDetails}>
    <p className={styles.detailField}>
      <span className={styles.detailLabel}>Version: </span>
      {release.releaseVersion}
    </p>
    <p className={styles.detailField}>
      <span className={styles.detailLabel}>Release date: </span>
      {release.releaseDate ?? "(Unknown)"}
    </p>
    {release.formats.length > 0 && (
      <div className={styles.detailBlock}>
        <span className={styles.detailLabel}>
          {release.formats.length === 1 ? "Format:" : "Formats:"}
        </span>
        <ul className={styles.formatsList}>
          {release.formats.map((format) => (
            <ReleaseFormatItem key={format.id} format={format} />
          ))}
        </ul>
      </div>
    )}
    {release.discogsUrl && (
      <p className={styles.detailField}>
        <span className={styles.detailLabel}>Discogs: </span>
        <a href={release.discogsUrl} target="_blank" rel="noreferrer">
          {release.discogsUrl}
        </a>
      </p>
    )}
    {release.tags.length > 0 && (
      <div className={styles.detailBlock}>
        <span className={styles.detailLabel}>Tags:</span>
        <ul className={styles.tagsList}>
          {release.tags.map((tag) => (
            <li key={tag} className={styles.tagsListItem}>
              {tag}
            </li>
          ))}
        </ul>
      </div>
    )}
    <ReleaseCountries countries={release.countries} />
    <ReleaseCatNumbers catalogueNumbers={release.catalogueNumbers} />
    <ReleaseMatrixRunout matrixRunout={release.matrixRunout} />
    {release.comment && (
      <p className={styles.detailComment}>{release.comment}</p>
    )}
    {release.conditionProblems && (
      <p className={styles.detailField}>
        <span className={styles.detailLabel}>Condition problems: </span>
        {release.conditionProblems}
      </p>
    )}
    {release.partOfQueenCollection && !entry.partOfQueenCollection && (
      <p className={styles.detailField}>
        <span className={styles.detailLabelItalic}>
          Part of Queen collection
        </span>
      </p>
    )}
    {release.relationToQueen && (
      <p className={styles.detailField}>
        <span className={styles.detailLabel}>Relation to Queen: </span>
        {release.relationToQueen}
      </p>
    )}
  </div>
);

export default ReleaseDetails;
