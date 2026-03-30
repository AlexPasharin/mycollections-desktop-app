import { type FC } from "react";

import styles from "./EntryRelease.module.css";

import ReleaseDetails from "../ReleaseDetails";

import type {
  EntryRelease as EntryReleaseRow,
  ReleaseByIdResult,
} from "@/types/releases";

type EntryReleaseProps = {
  release: EntryReleaseRow;
  isExpanded: boolean;
  onToggle: () => void;
  cached: ReleaseByIdResult | false | undefined;
  isLoading: boolean;
};

const EntryRelease: FC<EntryReleaseProps> = ({
  release,
  isExpanded,
  onToggle,
  cached,
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
            {!isLoading && cached === false && (
              <p className={styles.detailsMissing}>
                Could not load release details.
              </p>
            )}
            {!isLoading && cached && typeof cached === "object" && (
              <ReleaseDetails release={cached} />
            )}
          </div>
        )}
      </div>
    </div>
  </li>
);

export default EntryRelease;
