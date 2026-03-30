import { type FC } from "react";

import styles from "./EntryRelease.module.css";

import ReleaseDetails from "../ReleaseDetails";

import type { EntryByIdResult } from "@/types/entries";
import type {
  EntryRelease as EntryReleaseRow,
  ReleaseByIdResult,
} from "@/types/releases";

type EntryReleaseProps = {
  entry: EntryByIdResult;
  release: EntryReleaseRow;
  isExpanded: boolean;
  onToggle: () => void;
  releaseDetails: ReleaseByIdResult | undefined;
  loadFailed: boolean;
  isLoading: boolean;
};

const EntryRelease: FC<EntryReleaseProps> = ({
  entry,
  release,
  isExpanded,
  onToggle,
  releaseDetails,
  loadFailed,
  isLoading,
}) => (
  <li className={styles.entryRelease}>
    <button
      type="button"
      className={styles.releaseRow}
      aria-expanded={isExpanded}
      onClick={onToggle}
    >
      <span className={styles.releaseRowMain}>
        <span className={styles.releaseVersion}>{release.version}</span>
        {release.formats.length > 0 && ` (${release.formats.join(", ")})`}
      </span>
      <span
        className={isExpanded ? styles.chevronExpanded : styles.chevron}
        aria-hidden
      />
    </button>
    <div
      className={
        isExpanded
          ? `${styles.detailsSlide} ${styles.detailsSlideOpen}`
          : styles.detailsSlide
      }
    >
      <div className={styles.detailsSlideInner}>
        {isExpanded && (
          <div className={styles.releaseDetailsPanel}>
            {isLoading && (
              <p className={styles.detailsLoading}>Loading details…</p>
            )}
            {!isLoading && loadFailed && (
              <p className={styles.detailsMissing}>
                Could not load release details.
              </p>
            )}
            {!isLoading && releaseDetails && (
              <ReleaseDetails entry={entry} release={releaseDetails} />
            )}
          </div>
        )}
      </div>
    </div>
  </li>
);

export default EntryRelease;
