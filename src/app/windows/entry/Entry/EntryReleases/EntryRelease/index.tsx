import { useEffect, useState, type FC } from "react";

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

type DetailsStatus = "idle" | "loading" | "loaded" | "notFound" | "failed";

type EntryReleaseProps = {
  entry: EntryByIdResult;
  primaryDbSource: DbSource;
  releaseId: string;

  /**
   * Collapsed-row header data. Optional: when absent (focused mode) the header
   * is derived from the loaded details.
   */
  releaseSummary: EntryReleaseRow | undefined;
  allCountries: CountryListItem[];
  defaultExpanded: boolean;
  isRecentlyAdded: boolean;
  isRecentlyEdited: boolean;
  showReleaseActions: boolean;
  onUseAsBlueprint: (releaseBlueprint: ReleaseByIdResult) => void;
  onEdit: (release: ReleaseByIdResult) => void;
  onDeleted: (deletedReleaseVersion: string, errors: string[]) => void;
};

const EntryRelease: FC<EntryReleaseProps> = ({
  entry,
  primaryDbSource,
  releaseId,
  releaseSummary,
  allCountries,
  defaultExpanded,
  isRecentlyAdded,
  isRecentlyEdited,
  showReleaseActions,
  onUseAsBlueprint,
  onEdit,
  onDeleted,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [details, setDetails] = useState<ReleaseByIdResult>();
  const [detailsStatus, setDetailsStatus] = useState<DetailsStatus>("idle");

  // Load (and reload) details whenever this release is expanded; the cleanup
  // flag discards stale responses on collapse, db-source change, or unmount.
  useEffect(() => {
    if (!isExpanded) {
      setDetails(undefined);
      setDetailsStatus("idle");

      return;
    }

    let ignore = false;
    setDetails(undefined);
    setDetailsStatus("loading");

    api
      .getReleaseById(releaseId, primaryDbSource)
      .then((row) => {
        if (ignore) {
          return;
        }

        if (!row) {
          setDetailsStatus("notFound");

          return;
        }

        setDetails(row);
        setDetailsStatus("loaded");
      })
      .catch((error: unknown) => {
        if (ignore) {
          return;
        }

        console.error("Error loading release details", error);
        setDetailsStatus("failed");
      });

    return () => {
      ignore = true;
    };
  }, [isExpanded, releaseId, primaryDbSource]);

  const displayRow = releaseSummary ?? rowFromDetails(details);
  const versionLabel =
    displayRow?.version ??
    (detailsStatus === "loading" ? "Loading\u2026" : "Release");
  const displayFormats = displayRow?.formats ?? [];
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

    deleteReleaseFromDbSources(releaseId, checkedDbSources)
      .then((outcomes: DeleteReleaseOutcome[]) => {
        const errors = outcomes
          .filter((outcome) => outcome.status === "rejected")
          .map((outcome) => outcome.reason);

        console.info("Deleted release", {
          outcomes,
          errors: errors.length > 0 ? errors : undefined,
        });
        setIsConfirmOpen(false);
        onDeleted(releaseId, buildDeleteReleaseFeedback(outcomes).errors);
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
          onClick={() => setIsExpanded((expanded) => !expanded)}
        >
          <span className={styles.releaseRowMain}>
            <span className={styles.releaseVersion}>{versionLabel}</span>
            {displayFormats.length > 0 && ` (${displayFormats.join(", ")})`}
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
          aria-label={`Remove release ${versionLabel}`}
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
              {detailsStatus === "loading" && (
                <p className={styles.detailsLoading}>Loading details…</p>
              )}
              {detailsStatus === "notFound" && (
                <p className={styles.detailsMissing}>
                  This release could not be found in this entry&apos;s
                  collection.
                </p>
              )}
              {detailsStatus === "failed" && (
                <p className={styles.detailsMissing}>
                  Could not load release details.
                </p>
              )}
              {detailsStatus === "loaded" && details && (
                <>
                  <ReleaseDetails
                    entry={entry}
                    release={details}
                    allCountries={allCountries}
                  />
                  {showReleaseActions && (
                    <div className={styles.detailsActions}>
                      <button
                        type="button"
                        className={styles.detailsActionButton}
                        onClick={() => onEdit(details)}
                        aria-label={`Edit release ${versionLabel}`}
                      >
                        Edit release
                      </button>
                      <button
                        type="button"
                        className={styles.detailsActionButtonSecondary}
                        onClick={() => onUseAsBlueprint(details)}
                        aria-label={`Use release ${versionLabel} as a blueprint to add a new release`}
                      >
                        Use as a blueprint to add a new release
                      </button>
                    </div>
                  )}
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
              Remove release <strong>{versionLabel}</strong> from your
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

/** Derives the collapsed-row header shape from already-fetched release details. */
const rowFromDetails = (
  details: ReleaseByIdResult | undefined,
): EntryReleaseRow | undefined =>
  details
    ? {
        releaseId: details.releaseId,
        version: details.releaseVersion,
        formats: Array.from(
          new Set(details.formats.map((format) => format.shortName)),
        ),
      }
    : undefined;

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
