import { useState, type FC } from "react";

import styles from "./EntryRelease.module.css";

import api from "../../../api";
import ReleaseDetails from "../ReleaseDetails";

import ConfirmDialog from "@/app/components/ConfirmDialog";
import DbSourcesCheckboxes from "@/app/components/DbSourcesCheckboxes";
import type { DbSource } from "@/db/db-source";
import { ALL_DB_SOURCES, dbSourceLabel } from "@/db/db-source-options";
import type { CountryListItem } from "@/types/countries";
import type { EntryByIdResult } from "@/types/entries";
import type {
  DeleteReleaseResult,
  EntryRelease as EntryReleaseRow,
  ReleaseByIdResult,
} from "@/types/releases";

type EntryReleaseProps = {
  entry: EntryByIdResult;
  primaryDbSource: DbSource;
  release: EntryReleaseRow;
  allCountries: CountryListItem[];
  isExpanded: boolean;
  onToggle: () => void;
  releaseDetails: ReleaseByIdResult | undefined;
  loadFailed: boolean;
  isLoading: boolean;
  isRecentlyAdded: boolean;
  isRecentlyEdited: boolean;
  onUseAsBlueprint: (releaseBlueprint: ReleaseByIdResult) => void;
  onEdit: (release: ReleaseByIdResult) => void;
  onDeleted: (deletedReleaseVersion: string, errors: string[]) => void;
};

const EntryRelease: FC<EntryReleaseProps> = ({
  entry,
  primaryDbSource,
  release,
  allCountries,
  isExpanded,
  onToggle,
  releaseDetails,
  loadFailed,
  isLoading,
  isRecentlyAdded,
  isRecentlyEdited,
  onUseAsBlueprint,
  onEdit,
  onDeleted,
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  const [checkedDbSources, setCheckedDbSources] = useState<Set<DbSource>>(
    () => new Set(ALL_DB_SOURCES),
  );

  const openConfirm = () => {
    setDeleteError(undefined);
    setCheckedDbSources(new Set(ALL_DB_SOURCES));
    setIsConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (isDeleting) {
      return;
    }

    setIsConfirmOpen(false);
    setDeleteError(undefined);
  };

  const handleToggleDbSource = (source: DbSource) => {
    setCheckedDbSources((prev) => {
      const next = new Set(prev);

      if (next.has(source)) {
        next.delete(source);
      } else {
        next.add(source);
      }

      return next;
    });
  };

  const handleConfirmDelete = () => {
    setIsDeleting(true);
    setDeleteError(undefined);

    deleteReleaseFromDbSources(release.releaseId, checkedDbSources)
      .then((outcomes: DeleteReleaseOutcome[]) => {
        const errors = outcomes
          .filter((outcome) => outcome.status === "rejected")
          .map((outcome) => outcome.reason);

        console.info("Deleted release", {
          outcomes,
          errors: errors.length > 0 ? errors : undefined,
        });
        setIsConfirmOpen(false);
        onDeleted(
          release.releaseId,
          buildDeleteReleaseFeedback(outcomes).errors,
        );
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
            {isRecentlyEdited && (
              <span className={styles.recentlyEditedBadge}>
                Recently edited
              </span>
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
                <>
                  <ReleaseDetails
                    entry={entry}
                    release={releaseDetails}
                    allCountries={allCountries}
                  />
                  <div className={styles.detailsActions}>
                    <button
                      type="button"
                      className={styles.detailsActionButton}
                      onClick={() => onEdit(releaseDetails)}
                      aria-label={`Edit release ${release.version}`}
                    >
                      Edit release
                    </button>
                    <button
                      type="button"
                      className={styles.detailsActionButtonSecondary}
                      onClick={() => onUseAsBlueprint(releaseDetails)}
                      aria-label={`Use release ${release.version} as a blueprint to add a new release`}
                    >
                      Use as a blueprint to add a new release
                    </button>
                  </div>
                </>
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
            <p>
              Remove release <strong>{release.version}</strong> from your
              collection? This cannot be undone.
            </p>
            <DbSourcesCheckboxes
              heading="Remove from databases"
              headingId="delete-release-db-sources-heading"
              idPrefix="delete-release-db-source"
              activeDbSource={primaryDbSource}
              checkedSources={checkedDbSources}
              onToggle={handleToggleDbSource}
            />
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

type DeleteReleaseOutcome =
  | {
      source: DbSource;
      status: "fulfilled";
      result: DeleteReleaseResult;
    }
  | {
      source: DbSource;
      status: "rejected";
      reason: unknown;
    };

const deleteReleaseFromDbSources = (
  releaseId: string,
  dbSources: Set<DbSource>,
): Promise<DeleteReleaseOutcome[]> =>
  Promise.all(
    Array.from(dbSources).map((source) =>
      api
        .deleteRelease(releaseId, source)
        .then((result) => ({ status: "fulfilled" as const, result, source }))
        .catch(
          (reason: unknown) =>
            ({ status: "rejected" as const, reason, source }) as const,
        ),
    ),
  );

const formatDeleteReleaseError = (reason: unknown): string =>
  reason instanceof Error ? reason.message : "Failed to delete release";

const buildDeleteReleaseFeedback = (
  outcomes: DeleteReleaseOutcome[],
): { errors: string[] } => {
  const errors: string[] = [];

  for (const outcome of outcomes) {
    if (outcome.status === "rejected") {
      const { source, reason } = outcome;

      const errorMessage = `Failed to delete release in ${dbSourceLabel(source)}`;
      console.error(errorMessage, reason);

      errors.push(`${errorMessage}: ${formatDeleteReleaseError(reason)}`);
    }
  }

  return { errors };
};
