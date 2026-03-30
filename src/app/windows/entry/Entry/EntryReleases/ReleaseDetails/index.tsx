import { type FC } from "react";

import { formatJson } from "./formatJson";
import styles from "./ReleaseDetails.module.css";

import type { EntryByIdResult } from "@/types/entries";
import type { ReleaseByIdResult } from "@/types/releases";

type ReleaseDetailsProps = {
  entry: EntryByIdResult;
  release: ReleaseByIdResult;
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
    {release.discogsUrl && (
      <p className={styles.detailField}>
        <span className={styles.detailLabel}>Discogs: </span>
        <a href={release.discogsUrl} target="_blank" rel="noreferrer">
          {release.discogsUrl}
        </a>
      </p>
    )}
    {formatJson(release.countries) && (
      <div className={styles.detailBlock}>
        <span className={styles.detailLabel}>Countries:</span>
        <pre className={styles.jsonPre}>{formatJson(release.countries)}</pre>
      </div>
    )}
    {formatJson(release.catalogueNumbers) && (
      <div className={styles.detailBlock}>
        <span className={styles.detailLabel}>Catalogue numbers:</span>
        <pre className={styles.jsonPre}>
          {formatJson(release.catalogueNumbers)}
        </pre>
      </div>
    )}
    {formatJson(release.matrixRunout) && (
      <div className={styles.detailBlock}>
        <span className={styles.detailLabel}>Matrix / runout:</span>
        <pre className={styles.jsonPre}>{formatJson(release.matrixRunout)}</pre>
      </div>
    )}
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
