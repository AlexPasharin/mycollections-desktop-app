import { useState, type FC } from "react";

import styles from "./EntryRelease.module.css";

import api from "../../../api";
import ReleaseDetails from "../ReleaseDetails";

import ConfirmDialog from "@/app/components/ConfirmDialog";
import type { DbSource } from "@/db/db-source";
import type { EntryByIdResult } from "@/types/entries";
import type {
  EntryRelease as EntryReleaseRow,
  ReleaseByIdResult,
} from "@/types/releases";

type EntryReleaseProps = {
  entry: EntryByIdResult;
  dbSource: DbSource;
  release: EntryReleaseRow;
  isExpanded: boolean;
  onToggle: () => void;
  releaseDetails: ReleaseByIdResult | undefined;
  loadFailed: boolean;
  isLoading: boolean;
  isRecentlyAdded: boolean;
  onDeleted: (deletedReleaseVersion: string) => void;
};

const EntryRelease: FC<EntryReleaseProps> = ({
  entry,
  dbSource,
  release,
  isExpanded,
  onToggle,
  releaseDetails,
  loadFailed,
  isLoading,
  isRecentlyAdded,
  onDeleted,
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();

  const openConfirm = () => {
    setDeleteError(undefined);
    setIsConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (isDeleting) {
      return;
    }

    setIsConfirmOpen(false);
    setDeleteError(undefined);
  };

  const handleConfirmDelete = () => {
    setIsDeleting(true);
    setDeleteError(undefined);

    api
      .deleteRelease(release.releaseId, dbSource)
      .then((deleted) => {
        console.info("Deleted release", deleted);
        setIsConfirmOpen(false);
        onDeleted(deleted.release.releaseVersion);
      })
      .catch((error: unknown) => {
        console.error("Failed to delete release", error);
        setDeleteError(
          error instanceof Error ? error.message : "Failed to delete release",
        );
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  return (
    <li className={styles.entryRelease}>
      <div className={styles.releaseRow}>
        <button
          type="button"
          className={styles.releaseToggle}
          aria-expanded={isExpanded}
          onClick={onToggle}
        >
          <span className={styles.releaseRowMain}>
            <span className={styles.releaseVersion}>{release.version}</span>
            {release.formats.length > 0 && ` (${release.formats.join(", ")})`}
            {isRecentlyAdded && (
              <span className={styles.recentlyAddedBadge}>Recently added</span>
            )}
          </span>
          <span
            className={isExpanded ? styles.chevronExpanded : styles.chevron}
            aria-hidden
          />
        </button>
        <button
          type="button"
          className={styles.releaseRemove}
          onClick={openConfirm}
          aria-label={`Remove release ${release.version}`}
          title="Remove release"
        >
          Remove
        </button>
      </div>
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
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Remove release?"
        description={
          <>
            Remove release <strong>{release.version}</strong> from your
            collection? This cannot be undone.
          </>
        }
        confirmLabel="Remove"
        tone="danger"
        isBusy={isDeleting}
        errorMessage={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={closeConfirm}
      />
    </li>
  );
};

export default EntryRelease;
